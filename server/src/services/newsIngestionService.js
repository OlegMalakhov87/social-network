const Parser = require('rss-parser');
const { Op } = require('sequelize');

const { News, NewsIngestionRecord } = require('../../db/models');
const { NEWS_SOURCES_CONFIG } = require('../../config/newsSourcesConfig');
const { NEWS_AUTOMATION_CONFIG } = require('../../config/newsAutomationConfig');

/**
 * Задает разбор RSS с таймаутом и заголовком User-Agent приложения.
 */
const parser = new Parser({
  timeout: 10000,
  requestOptions: {
    headers: {
      'User-Agent': `${process.env.APP_NAME}/${process.env.APP_VERSION}`,
    },
  },
});

/**
 * Преобразует дату RSS в Date.
 *
 * Некорректные или отсутствующие значения превращаются в null,
 * чтобы не передавать Invalid Date дальше в ingestion pipeline.
 *
 * @param {string|null|undefined} value - Значение поля
 * @returns {Date|null} Дата или null.
 */
const parseDate = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Формирует составной ключ источника и внешнего ID.
 *
 * Используется для O(1)-проверок через Set при batch-фильтрации.
 *
 * @param {string} source - Источник новости
 * @param {string} externalId - Внешний идентификатор
 * @returns {string} Составной ключ источника и внешнего ID.
 */
const getSourceExternalIdKey = (source, externalId) =>
  `${source}\u0000${externalId}`;

const newsIngestionService = {
  /**
   * Возвращает RSS-ленту одного источника.
   *
   * @param {Object} source - Источник новости
   * @returns {Promise<Object>} RSS-лента.
   */
  async fetchFeed(source) {
    try {
      const feed = await parser.parseURL(source.url);

      return {
        source,
        feed,
      };
    } catch (error) {
      console.error(
        `[NewsIngestion] Не удалось получить ${source.name}:`,
        error.message
      );

      return null;
    }
  },

  /**
   * Нормализует RSS item разных поставщиков в единый формат,
   * с которым дальше работают dedup, selector и LLM.
   *
   * RSS-специфичные поля после этого этапа наружу не передаются.
   *
   * @param {Object} item - RSS item
   * @param {Object} source - Источник новостей
   * @returns {Object} - Нормализованная структура новости
   */
  normalizeItem(item, source) {
    const externalUrl = item.link?.trim() || null;

    const externalId = item.guid?.trim() || externalUrl || null;

    const publishedAt = parseDate(item.isoDate || item.pubDate);

    return {
      origin: 'automated',
      source: source.name,
      externalId,
      externalUrl,
      publishedAt,
      title: item.title?.trim() || null,
      text: item.contentSnippet?.trim() || item.content?.trim() || null,
      category: source.category || item.categories?.[0]?.trim() || 'other',
    };
  },

  /**
   * Возвращает terminal-кандидатов, которые больше нельзя обрабатывать:
   * - published — уже опубликованы;
   * - rejected — уже отклонены редактором;
   * - failed с исчерпанным maxAttempts — больше не повторяются.
   *
   * failed с attempts < maxAttempts намеренно не возвращаются,
   * чтобы следующий запуск мог повторить их обработку.
   *
   * @param {Object[]} candidates - Кандидаты на публикацию
   * @returns {Promise<Set<string>>} Множество ключей, где ключ - это source и externalId.
   */
  async getProcessedKeys(candidates) {
    if (!candidates.length) {
      return new Set();
    }

    const conditions = candidates.map(({ source, externalId }) => ({
      source,
      externalId,
    }));

    const records = await NewsIngestionRecord.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: conditions,
          },
          {
            [Op.or]: [
              {
                status: {
                  [Op.in]: ['published', 'rejected'],
                },
              },
              {
                status: 'failed',
                attempts: {
                  [Op.gte]: NEWS_AUTOMATION_CONFIG.maxAttempts,
                },
              },
            ],
          },
        ],
      },
      attributes: ['source', 'externalId'],
      raw: true,
    });

    return new Set(
      records.map(({ source, externalId }) =>
        getSourceExternalIdKey(source, externalId)
      )
    );
  },

  /**
   * Проверяет кандидатов непосредственно по таблице News.
   *
   * Дубликатом считается совпадение:
   * 1. пары source + externalId;
   * 2. либо externalUrl.
   *
   * Эта проверка дополняет NewsIngestionRecord и защищает от повторного
   * создания News даже при несогласованном ingestion state.
   *
   * @param {Object[]} candidates - Кандидаты на публикацию
   * @returns {Promise<{externalIdKeys: Set<string>, externalUrls: Set<string>}>} Множества ключей source и externalId и внешних URL.
   */
  async getDuplicateKeys(candidates) {
    if (!candidates.length) {
      return {
        externalIdKeys: new Set(),
        externalUrls: new Set(),
      };
    }

    const sourceExternalIdConditions = candidates.map(
      ({ source, externalId }) => ({
        source,
        externalId,
      })
    );

    const externalUrls = candidates
      .map(({ externalUrl }) => externalUrl)
      .filter(Boolean);

    const news = await News.findAll({
      where: {
        [Op.or]: [
          ...sourceExternalIdConditions,
          {
            externalUrl: {
              [Op.in]: externalUrls,
            },
          },
        ],
      },
      attributes: ['source', 'externalId', 'externalUrl'],
      raw: true,
    });

    return {
      externalIdKeys: new Set(
        news
          .filter(({ source, externalId }) => source && externalId)
          .map(({ source, externalId }) =>
            getSourceExternalIdKey(source, externalId)
          )
      ),

      externalUrls: new Set(
        news.map(({ externalUrl }) => externalUrl).filter(Boolean)
      ),
    };
  },

  /**
   * Возвращает новые статьи из всех источников.
   *
   * @returns {Promise<Object>} Результат операции.
   */
  async fetchCandidates() {
    const candidates = [];

    for (const source of NEWS_SOURCES_CONFIG) {
      const result = await this.fetchFeed(source);
      if (!result) continue;

      // Получает и нормализует RSS items всех доступных источников.
      for (const item of result.feed.items ?? []) {
        const candidate = this.normalizeItem(item, result.source);

        if (
          !candidate.title ||
          !candidate.externalId ||
          !candidate.externalUrl
        ) {
          continue;
        }

        candidates.push(candidate);
      }
    }

    if (!candidates.length) {
      console.log('[NewsIngestion] Новых кандидатов: 0');
      return [];
    }

    // Исключает terminal-кандидатов по истории ingestion.
    const processedKeys = await this.getProcessedKeys(candidates);

    const unprocessedCandidates = candidates.filter(
      ({ source, externalId }) =>
        !processedKeys.has(getSourceExternalIdKey(source, externalId))
    );

    if (!unprocessedCandidates.length) {
      console.log('[NewsIngestion] Новых кандидатов: 0');
      return [];
    }

    // Дополнительно исключает новости, уже существующие в News.
    const duplicateKeys = await this.getDuplicateKeys(unprocessedCandidates);

    const newCandidates = unprocessedCandidates.filter(
      ({ source, externalId, externalUrl }) => {
        const externalIdKey = getSourceExternalIdKey(source, externalId);

        return (
          !duplicateKeys.externalIdKeys.has(externalIdKey) &&
          !duplicateKeys.externalUrls.has(externalUrl)
        );
      }
    );

    console.log(`[NewsIngestion] Новых кандидатов: ${newCandidates.length}`);

    return newCandidates;
  },
};

module.exports = newsIngestionService;
