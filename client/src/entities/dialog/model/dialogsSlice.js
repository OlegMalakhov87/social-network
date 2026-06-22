import { createSlice } from '@reduxjs/toolkit';

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState: {
    dialogsData: [
      {
        senderId: 3,
        receiverId: 8,
        message: 'Привет! Давно не общались. Как у тебя с работой?',
        isRead: true,
      },
      {
        senderId: 8,
        receiverId: 3,
        message: 'Привет, да, очень давно. Извини, я весь в запарках, учу JS. Как у тебя дела?',
        sender: 8,
        receiver: 2,
        isRead: true,
      },
      {
        senderId: 3,
        receiverId: 8,
        message: 'Все хорошо, не так давно устроилась на работу в Яндекс',
        isRead: true,
      },
      {
        senderId: 8,
        receiverId: 3,
        message: 'Поздравляю. У меня тоже все хорошо. Сейчас заканчиваю свой проект',
        isRead: false,
      },
      {
        senderId: 6,
        receiverId: 8,
        message: 'Чем занимаешься сейчас? Закончил свой проект?',
        isRead: true,
      },
      {
        senderId: 8,
        receiverId: 6,
        message: 'Пока нет. Думал, что получится закончить раньше, но увы.',
        isRead: false,
      },
      {
        senderId: 9,
        receiverId: 8,
        message: 'Привет, давно не виделись, чем занимаешься?',
        isRead: false,
      },
    ],
    newMessageText: '',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const { partnerId, newMessageText, currentUserId } = action.payload;
      const newId =
        state.dialogsData.length > 0 ? Math.max(...state.dialogsData.map((d) => d.id)) + 1 : 1;
      const newMessage = {
        id: newId,
        text: newMessageText,
        sender: currentUserId,
        receiver: partnerId,
        isRead: false,
        date: new Date().toISOString(),
      };
      state.dialogsData.push(newMessage);
      state.newMessageText = '';
    },
    updateNewMessageText: (state, action) => {
      state.newMessageText = action.payload;
    },

    deleteMessage: (state, action) => {
      const { messageId, currentUserId } = action.payload;
      if (!currentUserId) return;
      const userMessage = state.dialogsData.find(
        (msg) => msg.id === messageId && msg.sender === currentUserId
      );
      if (userMessage) {
        state.dialogsData = state.dialogsData.filter((msg) => msg.id !== userMessage.id);
      }
    },

    editMessage: (state, action) => {
      const { messageId, editText, currentUserId } = action.payload;
      if (!currentUserId) return;
      const editingMessage = state.dialogsData.find(
        (msg) => msg.id === messageId && msg.sender === currentUserId
      );
      if (editingMessage) editingMessage.text = editText;
    },
  },
});

export const { addMessage, updateNewMessageText, deleteMessage, editMessage } =
  dialogsSlice.actions;

export default dialogsSlice.reducer;
