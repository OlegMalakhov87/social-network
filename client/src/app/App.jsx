import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import './style/App.css';

// Pages
import { DialogsPage } from '../pages/dialogs';
import { FriendsPage } from '../pages/friends';
import { MusicPage } from '../pages/music';
import { NewsPage } from '../pages/news';
import { ProfilePage } from '../pages/profile';
import { SettingsPage } from '../pages/settings';
import { VideosPage } from '../pages/videos';

// Widgets
import {
  AudioPlayerContainer,
  AudioPlayerProvider,
} from '../widgets/audio-player';
import { Footer } from '../widgets/footer';
import { Header } from '../widgets/header';
import { AppShellSkeleton } from '../widgets/layout';
import { Navbar } from '../widgets/navbar';
import { Sidebar } from '../widgets/sidebar';

// Features
import { LoginPage, RegisterPage } from '../features/auth';

// Shared
import { PageLoader, ToastProvider } from '../shared/ui';

// Redux
import {
  fetchCurrentUser,
  selectIsAuthenticated,
  selectIsAuthLoading,
} from '../entities/auth';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isUserLoading = useSelector(selectIsAuthLoading);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /** Применение темы из localStorage или системной темы */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const appliedTheme =
      savedTheme === 'system'
        ? mediaQuery.matches
          ? 'dark'
          : 'light'
        : savedTheme;

    document.documentElement.setAttribute('data-theme', appliedTheme);
  }, []);

  /** Проверка авторизации */
  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem('token')) {
        await dispatch(fetchCurrentUser());
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [dispatch]);

  // 1. Первоначальная проверка токена (до рендера чего-либо)
  if (isCheckingAuth) {
    return (
      <ToastProvider>
        <PageLoader message="Загрузка приложения..." />
      </ToastProvider>
    );
  }

  // 2. НЕ авторизован: показываем ТОЛЬКО форму на пустом экране
  if (!isAuthenticated) {
    return (
      <AudioPlayerProvider>
        <ToastProvider>
          <div className="auth_wrapper">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </AudioPlayerProvider>
    );
  }

  // 3. АВТОРИЗОВАН, но данные пользователя еще грузятся -> ПОКАЗЫВАЕМ APP SHELL SKELETON
  if (isUserLoading) {
    return (
      <AudioPlayerProvider>
        <ToastProvider>
          <AppShellSkeleton />
        </ToastProvider>
      </AudioPlayerProvider>
    );
  }

  // 4. АВТОРИЗОВАН и данные загружены -> ПОКАЗЫВАЕМ ПОЛНОЦЕННЫЙ ИНТЕРФЕЙС
  return (
    <AudioPlayerProvider>
      <ToastProvider>
        <div className="app_wrapper">
          <header className="header">
            <Header onSearchChange={setSearchQuery} />
          </header>

          <nav className="navbar">
            <Navbar />
          </nav>

          <aside className="info">
            <Sidebar />
          </aside>

          <main className="main">
            <Routes>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/messages" element={<DialogsPage />} />
              <Route path="/messages/:userId" element={<DialogsPage />} />
              <Route
                path="/friends"
                element={<FriendsPage searchQuery={searchQuery} />}
              />
              <Route path="/friends/:friendId" element={<ProfilePage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <Footer />
          </footer>

          <AudioPlayerContainer />
        </div>
      </ToastProvider>
    </AudioPlayerProvider>
  );
};

export default App;
