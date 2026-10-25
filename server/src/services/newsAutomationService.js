const {
  News,
  User,
  NewsIngestionRecord,
  sequelize,
} = require('../../db/models');
const newsIngestionService = require('./newsIngestionService');
const newsLlmService = require('./llm/newsLlmService');
const { NEWS_AUTOMATION_CONFIG } = require('../../config/newsAutomationConfig');

const newsAutomationService = {
  /**
   * Находит системного пользователя, от имени которого создаются автоматические News.
   *
   * Отсутствие бота считается фатальной ошибкой запуска.
   *
   * @returns {Promise<Object>} Системный бот для публикации новостей.
   */
  async getBotUser() {
    const bot = await User.findOne({
      where: {
        nickname: NEWS_AUTOMATION_CONFIG.botNickname,
        isSystem: true,
      },
      attributes: ['id'],
    });

    if (!bot) {
      throw new Error(
        `News Bot "${NEWS_AUTOMATION_CONFIG.botNickname}" not found`
      );
    }

    return bot;
  },

  /**
   * Записывает в базу данных техническую ошибку обработки новости.
   *
   * @param {Object} candidate - Кандидат на публикацию
   * @param {Error} error - Ошибка
   * @returns {Promise<Object>} Результат операции.
   */
  async recordFailure(candidate, error) {
    return sequelize.transaction(async (transaction) => {
      const [record, created] = await NewsIngestionRecord.findOrCreate({
        where: {
          source: candidate.source,
          externalId: candidate.externalId,
        },

        defaults: {
          source: candidate.source,
          externalId: candidate.externalId,
          externalUrl: candidate.externalUrl,

          status: 'failed',
          reason: null,
          attempts: 1,
          lastError: error.message,
          newsId: null,
          processedAt: new Date(),
        },

        transaction,
      });

      // Terminal-запись нельзя вернуть обратно в failed, даже если параллельная/устаревшая обработка завершилась ошибкой.
      if (!created && ['published', 'rejected'].includes(record.status)) {
        return record;
      }

      // Для уже существующего failed-кандидата атомарно увеличивает число неудачных попыток и сохраняет последнюю ошибку.
      if (!created) {
        await record.increment('attempts', {
          by: 1,
          transaction,
        });

        await record.update(
          {
            externalUrl: candidate.externalUrl,
            status: 'failed',
            reason: null,
            lastError: error.message,
            processedAt: new Date(),
          },
          {
            transaction,
          }
        );
      }

      return record;
    });
  },

  /**
   * Атомарно публикует автоматическую новость и фиксирует terminal-статус.
   *
   * published. Если любая запись не сохранится, транзакция откатится целиком.
   *
   * @param {Object} candidate - Кандидат на публикацию
   * @param {Object} analysis - Результат анализа модели
   * @param {number} botUserId - Идентификатор служебного пользователя
   * @returns {Promise<Object>} Результат операции.
   */
  async publishCandidate(candidate, analysis, botUserId) {
    return sequelize.transaction(async (transaction) => {
      const news = await News.create(
        {
          uploadedBy: botUserId,

          title: analysis.title,
          text: analysis.summary,
          category: analysis.category,

          type: 'text',
          newsUrl: null,
          previewUrl: null,
          thumbnailUrl: null,

          origin: 'automated',
          source: candidate.source,
          externalUrl: candidate.externalUrl,
          externalId: candidate.externalId,
          publishedAt: candidate.publishedAt,

          isEdited: false,
          archivedAt: null,
          viewsCount: 0,
        },
        {
          transaction,
        }
      );

      await NewsIngestionRecord.upsert(
        {
          source: candidate.source,
          externalId: candidate.externalId,
          externalUrl: candidate.externalUrl,

          status: 'published',
          reason: analysis.reason,
          lastError: null,
          newsId: news.id,
          processedAt: new Date(),
        },
        {
          transaction,
        }
      );

      return news;
    });
  },

  /**
   * Выбирает кандидатов для обработки, равномерно распределяя их между источниками.
   *
   * @param {Array<Object>} candidates - Кандидаты на публикацию
   * @returns {Array<Object>} - Кандидаты для обработки
   */
  selectCandidates(candidates) {
    const { maxCandidatesPerSourcePerRun, maxCandidatesPerRun } =
      NEWS_AUTOMATION_CONFIG;

    if (!candidates.length) {
      return [];
    }

    // Группирует кандидатов по источникам.
    const candidatesBySource = new Map();

    for (const candidate of candidates) {
      if (!candidatesBySource.has(candidate.source)) {
        candidatesBySource.set(candidate.source, []);
      }

      const sourceCandidates = candidatesBySource.get(candidate.source);

      // Ограничивает количество кандидатов от каждого отдельного источника.
      if (sourceCandidates.length < maxCandidatesPerSourcePerRun) {
        sourceCandidates.push(candidate);
      }
    }

    const selectedCandidates = [];

    // Количество round-robin проходов определяется размером самой большой группы.
    const maxSourceLength = Math.max(
      ...Array.from(
        candidatesBySource.values(),
        (sourceCandidates) => sourceCandidates.length
      )
    );

    // Round-robin: берет по одному кандидату от каждого источника за один проход.
    // maxSourceLength - максимальное количество кандидатов, которое может находиться в одной группе.
    for (let index = 0; index < maxSourceLength; index += 1) {
      for (const sourceCandidates of candidatesBySource.values()) {
        if (selectedCandidates.length >= maxCandidatesPerRun) {
          return selectedCandidates;
        }

        const candidate = sourceCandidates[index];

        if (candidate) {
          selectedCandidates.push(candidate);
        }
      }
    }

    return selectedCandidates;
  },

  /**
   * Выполняет один полный цикл автоматизации: получает новых кандидатов RSS, применяет лимиты, анализирует выбранные материалы через LLM и фиксирует published, rejected или failed для каждого кандидата.
   *
   * Ошибка одного кандидата не останавливает обработку остальных.
   *
   * @returns {Promise<Object>} Результат операции.
   */
  async run() {
    const bot = await this.getBotUser();

    const candidates = await newsIngestionService.fetchCandidates();

    const candidatesToProcess = this.selectCandidates(candidates);

    const selectedBySource = {};

    for (const candidate of candidatesToProcess) {
      selectedBySource[candidate.source] =
        (selectedBySource[candidate.source] ?? 0) + 1;
    }

    console.log(
      '[NewsAutomation] Выбрано кандидатов по источникам:',
      selectedBySource
    );

    const result = {
      found: candidates.length, // после ingestion/dedup.
      selected: candidatesToProcess.length, // выбрано selector.
      processed: 0, // успешно проанализировано LLM.
      published: 0, // успешно опубликовано.
      rejected: 0, // успешно отклонено LLM.
      failed: 0, // технические ошибки обработки кандидата.
    };

    for (const candidate of candidatesToProcess) {
      try {
        const analysis = await newsLlmService.analyzeCandidate(candidate);

        result.processed += 1;

        if (!analysis.shouldPublish) {
          await NewsIngestionRecord.upsert({
            source: candidate.source,
            externalId: candidate.externalId,
            externalUrl: candidate.externalUrl,

            status: 'rejected',
            reason: analysis.reason,
            lastError: null,
            newsId: null,
            processedAt: new Date(),
          });
          result.rejected += 1;

          console.log(
            `[NewsAutomation] Отклонено: ${candidate.title}. Причина: ${analysis.reason}`
          );

          continue;
        }

        await this.publishCandidate(candidate, analysis, bot.id);

        result.published += 1;
      } catch (error) {
        result.failed += 1;

        try {
          await this.recordFailure(candidate, error);
        } catch (recordError) {
          console.error(
            `[NewsAutomation] Не удалось сохранить ошибку обработки "${candidate.title}":`,
            recordError.message
          );
        }

        console.error(
          `[NewsAutomation] Ошибка обработки "${candidate.title}":`,
          error.message
        );
      }
    }

    return result;
  },
};

module.exports = newsAutomationService;
