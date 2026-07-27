import { Skeleton } from '../../../shared/ui';
import style from './AppShellSkeleton.module.css';

/**
 * Скелетон оболочки всего приложения(имитирует загрузку Header, Navbar, Main, Sidebar и Footer).
 * Используется при первичной загрузке после авторизации.
 *
 * @returns {React.ReactNode}
 */
export const AppShellSkeleton = () => {
  return (
    <div className="app_wrapper">
      {/* 1. Header Skeleton */}
      <header className={`${style.skeletonArea} ${style.header}`}>
        <Skeleton width={40} height={40} circle />
        <Skeleton width="40%" height={36} radius="var(--radius-full)" />
        <Skeleton width={80} height={32} radius="var(--radius-md)" />
      </header>

      {/* 2. Navbar Skeleton */}
      <nav className={`${style.skeletonArea} ${style.navbar}`}>
        <div className={style.navList}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={style.navItem}>
              <Skeleton width={24} height={24} circle />
              <Skeleton width={80} height={16} />
            </div>
          ))}
        </div>
      </nav>

      {/* 3. Main Content Skeleton (имитируем профиль или ленту) */}
      <main className={`${style.skeletonArea} ${style.main}`}>
        <Skeleton
          width="100%"
          height={200}
          radius="var(--radius-lg)"
          className={style.mainBanner}
        />
        <div className={style.mainContent}>
          <Skeleton
            width="60%"
            height={24}
            style={{ marginBottom: 'var(--space-4)' }}
          />
          <Skeleton
            width="100%"
            height={120}
            radius="var(--radius-lg)"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <Skeleton width="100%" height={120} radius="var(--radius-lg)" />
        </div>
      </main>

      {/* 4. Sidebar Skeleton */}
      <aside className={`${style.skeletonArea} ${style.info}`}>
        <Skeleton
          width="100%"
          height={150}
          radius="var(--radius-lg)"
          style={{ marginBottom: 'var(--space-4)' }}
        />
        <Skeleton width="100%" height={200} radius="var(--radius-lg)" />
      </aside>

      {/* 5. Footer Skeleton */}
      <footer className={`${style.skeletonArea} ${style.footer}`}>
        <Skeleton width={250} height={16} />
        <div className={style.footerLinks}>
          <Skeleton width={120} height={16} />
          <Skeleton width={120} height={16} />
          <Skeleton width={120} height={16} />
        </div>
      </footer>
    </div>
  );
};
