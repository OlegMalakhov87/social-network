import './style/App.css';
// React
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
// Router
import { Routes, Route, Navigate } from 'react-router-dom';
// Pages
import { LoginPage } from '../pages/authorization';
import { RegisterPage } from '../pages/authorization';
import { ProfilePage } from '../pages/profile';
import { DialogsPage } from '../pages/dialogs';
import { NewsPage } from '../pages/news';
import { MusicPage } from '../pages/music';
import { VideosPage } from '../pages/videos';
import { SettingsPage } from '../pages/settings';
import { FriendsPage } from '../pages/friends';
// Widgets
import { Header } from '../widgets/header';
import { Navbar } from '../widgets/navbar';
import { Footer } from '../widgets/footer';
import { Sidebar } from '../widgets/sidebar';
import {
  AudioPlayerProvider,
  AudioPlayerContainer,
} from '../widgets/audio-player';
// Shared
import { PrivateRoute } from '../shared/ui';
import { ToastProvider } from '../shared/ui';
// Redux
import { fetchCurrentUser } from '../app/providers/slices/authSlice';

/**
 * Корневой компонент приложения.
 * Управляет маршрутизацией и глобальным состоянием поиска.
 */
const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

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
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <DialogsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages/:userId"
                element={
                  <PrivateRoute>
                    <DialogsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <PrivateRoute>
                    <FriendsPage searchQuery={searchQuery} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/friends/:friendId"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/news"
                element={
                  <PrivateRoute>
                    <NewsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/music"
                element={
                  <PrivateRoute>
                    <MusicPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/videos"
                element={
                  <PrivateRoute>
                    <VideosPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <Footer />
          </footer>

          {/* Глобальный аудиоплеер */}
          <AudioPlayerContainer />
        </div>
      </ToastProvider>
    </AudioPlayerProvider>
  );
};

export default App;
