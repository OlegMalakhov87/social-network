import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Получить список диалогов
export async function fetchDialogs() {
  const response = await apiFetch(`${BASE_URL}/messages/dialogs`);
  if (!response.ok) throw new Error(`Ошибка загрузки диалогов: ${response.status}`);
  return response.json();
}

// Получить список сообщений с выбранным пользователем
export async function fetchMessages(partnerId) {
  const response = await apiFetch(`${BASE_URL}/messages/conversation/${partnerId}`);
  if (!response.ok) throw new Error(`Ошибка загрузки сообщений: ${response.status}`);
  return response.json();
}

// Отправить сообщение
export async function sendMessageApi(receiverId, text) {
  const response = await apiFetch(`${BASE_URL}/messages`, {
    method: 'POST',
    body: JSON.stringify({ receiverId, message: text }),
  });
  if (!response.ok) throw new Error(`Ошибка отправки: ${response.status}`);
  return response.json();
}

// Скрыть сообщение (удаляет сообщение только у текущего пользователя)
export async function hideMessageApi(messageId) {
  const response = await apiFetch(`${BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
  return response.json();
}

// Редактировать сообщение
export async function editMessageApi(messageId, newText) {
  const response = await apiFetch(`${BASE_URL}/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ message: newText }),
  });
  if (!response.ok) throw new Error(`Ошибка редактирования: ${response.status}`);
  return response.json();
}

// Отметка о прочтении
export async function markMessagesAsRead(messageIds) {
  const response = await apiFetch(`${BASE_URL}/messages/read`, {
    method: 'PUT',
    body: JSON.stringify({ messageIds }),
  });
  if (!response.ok) throw new Error('Ошибка отметки прочтения');
  return response.json();
}

// Очистить чат с пользователем (удаляет чат только у текущего пользователя)
export async function clearChatApi(partnerId) {
  const response = await apiFetch(`${BASE_URL}/messages/clear/${partnerId}`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error('Ошибка очистки чата');
  return response.json();
}
