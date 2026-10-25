export * from './api/dialogApi'; // Выполняет запросы диалогов.

export { getMessageActions } from './lib/getMessageActions'; // Возвращает действия сообщения.
export { publishNewMessage, subscribeNewMessage } from './lib/messageEvents'; // Публикует новое сообщение и подписывает обработчик.
export { normalizeDialogs } from './lib/normalizeDialog'; // Приводит диалог к формату карточки.
export { normalizeMessages } from './lib/normalizeMessage'; // Приводит сообщение к формату карточки.

export * from './model/dialogsSchema'; // Описывает схемы диалогов.
export * from './model/messageSchema'; // Описывает схемы сообщений.

export { Dialog } from './ui/Dialog'; // Отображает карточку диалога.
export { Message } from './ui/Message'; // Отображает карточку сообщения.
