import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { audioPlayerReducer } from '../widgets/audio-player';
import App from './App';

/**
 * Мокирование authSlice.
 */
jest.mock('../entities/auth', () => ({
  checkAuth: () => ({ type: 'auth/checkAuth/test' }),
  selectIsAuthReady: (state) => !state.auth.isCheckingAuth,
  selectIsAuthenticated: (state) => state.auth.isAuthenticated,
  selectIsAuthenticatedAndReady: (state) =>
    state.auth.isAuthenticated && !state.auth.isCheckingAuth,
}));

// Состояние приложения на момент запуска.
const initialAuthState = {
  user: null,
  token: null,
  isCheckingAuth: true,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

/**
 * Создание тестового хранилища.
 *
 * @returns {Store} - Тестовое хранилище
 */
const createTestStore = () =>
  configureStore({
    reducer: {
      auth: (state = initialAuthState) => state,
      audioPlayer: audioPlayerReducer,
    },
  });

/**
 * Настройка тестового окружения для медиа-запросов и медиа-элементов.
 */
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  /**
   * Мокирование метода pause для медиа-элемента.
   */
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

  /**
   * Мокирование метода load для медиа-элемента.
   */

  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});

/**
 * Восстановление всех моков после тестов.
 */
afterAll(() => {
  jest.restoreAllMocks();
});

test('отображает загрузку, пока авторизация не проверена', () => {
  const store = createTestStore();

  expect(typeof window.matchMedia).toBe('function');

  expect(window.matchMedia('(prefers-color-scheme: dark)')).toEqual(
    expect.objectContaining({
      matches: false,
    })
  );

  render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByText('Загрузка приложения...')).toBeInTheDocument();
});
