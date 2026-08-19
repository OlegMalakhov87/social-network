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
import { LoginForm, RegisterForm } from '../features/auth';

// Shared
import { PageLoader, ToastProvider } from '../shared/ui';

// Redux
import {
  checkAuth,
  selectIsAuthenticated,
  selectIsAuthenticatedAndReady,
  selectIsAuthReady,
} from '../entities/auth';

const AppRoutes = ({ searchQuery, setSearchQuery }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthenticatedAndReady = useSelector(selectIsAuthenticatedAndReady);

  if (!isAuthenticated) {
    return (
      <div className="auth_wrapper">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  if (!isAuthenticatedAndReady) {
    return <AppShellSkeleton />;
  }

  return (
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
  );
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const isAuthReady = useSelector(selectIsAuthReady);

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

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <AudioPlayerProvider>
      <ToastProvider>
        {!isAuthReady ? (
          <PageLoader message="Загрузка приложения..." />
        ) : (
          <AppRoutes
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </ToastProvider>
    </AudioPlayerProvider>
  );
};

export default App;
