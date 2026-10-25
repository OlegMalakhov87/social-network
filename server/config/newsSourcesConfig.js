/**
 * Задает источники новостей для автоматического сбора.
 *
 * @type {Array<{name: string, url: string, category: string}>}
 */
const NEWS_SOURCES_CONFIG = [
  {
    name: 'DW Russian',
    url: 'https://rss.dw.com/rdf/rss-ru-top',
    category: 'other',
  },
  {
    name: 'Sports.ru',
    url: 'https://www.sports.ru/rss/topnews.xml',
    category: 'sport',
  },

  {
    name: 'Радио Свобода — Культура',
    url: 'https://www.svoboda.org/api/zmgqpml-vomx-tpeympp_',
    category: 'culture',
  },
];

module.exports = {
  NEWS_SOURCES_CONFIG,
};
