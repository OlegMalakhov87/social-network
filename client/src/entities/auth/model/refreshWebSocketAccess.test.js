import {
  handleWebSocketSessionRevoked,
  refreshWebSocketAccess,
} from './refreshWebSocketAccess';
import { logout, setAccessToken } from './authSlice';

const makeState = (token = 'old-token') => ({
  auth: {
    token,
    isAuthenticated: true,
    isLoggingOut: false,
    authCheckRequestId: null,
    authMutationRequestId: null,
  },
});

const makeContext = (state = makeState()) => {
  const coordinator = {
    refreshSession: jest.fn().mockResolvedValue({ token: 'new-token' }),
    notifySessionRevoked: jest.fn(),
  };

  return {
    state,
    coordinator,
    dispatch: jest.fn(),
    getState: () => state,
  };
};

describe('WebSocket auth thunks', () => {
  test('4002: обновляет access token через общий координатор', async () => {
    const { dispatch, getState, coordinator } = makeContext();

    await refreshWebSocketAccess()(
      dispatch,
      getState,
      { coordinator }
    );

    expect(coordinator.refreshSession).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      setAccessToken({ token: 'new-token', expectedToken: 'old-token' })
    );
  });

  test('не запускает refresh, когда пользователь разлогинен', async () => {
    const state = makeState(null);
    state.auth.isAuthenticated = false;
    const { dispatch, getState, coordinator } = makeContext(state);

    await refreshWebSocketAccess()(
      dispatch,
      getState,
      { coordinator }
    );

    expect(coordinator.refreshSession).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('401 при refresh завершает текущую сессию и уведомляет вкладки', async () => {
    const { dispatch, getState, coordinator } = makeContext();
    const error = { response: { status: 401 } };
    coordinator.refreshSession.mockRejectedValue(error);

    await expect(
      refreshWebSocketAccess()(dispatch, getState, { coordinator })
    ).rejects.toBe(error);

    expect(coordinator.notifySessionRevoked).toHaveBeenCalledWith('old-token');
    expect(dispatch).toHaveBeenCalledWith(logout());
  });

  test('401 от старого JWT не завершает новую авторизацию', async () => {
    const state = makeState();
    const { dispatch, getState, coordinator } = makeContext(state);
    let rejectRefresh;

    coordinator.refreshSession.mockImplementation(
      () => new Promise((_resolve, reject) => { rejectRefresh = reject; })
    );

    const promise = refreshWebSocketAccess()(
      dispatch,
      getState,
      { coordinator }
    );

    state.auth.token = 'another-session-token';
    const error = { response: { status: 401 } };
    rejectRefresh(error);

    await expect(promise).rejects.toBe(error);
    expect(coordinator.notifySessionRevoked).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(logout());
  });

  test('4003: не разлогинивает другую текущую авторизацию', () => {
    const { dispatch, getState, coordinator } = makeContext();

    handleWebSocketSessionRevoked('token-from-previous-session')(
      dispatch,
      getState,
      { coordinator }
    );

    expect(dispatch).not.toHaveBeenCalled();
    expect(coordinator.notifySessionRevoked).not.toHaveBeenCalled();
  });
});
