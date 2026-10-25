import { Component } from 'react';

import { Button, Card } from '../../../ui';

import styles from './ErrorBoundary.module.css';

/**
 * Перехватывает ошибку отрисовки и показывает запасной экран.
 *
 * Не перехватывает ошибки в асинхронном коде, обработчиках событий и сетевых запросах.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @param {Function} [props.onReset] - Обработчик сброса ошибки
 * @returns {JSX.Element} Запасной экран или дочерние элементы.
 * @extends Component
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      resetKey: 0,
    };
  }

  /**
   * Возвращает состояние после ошибки отрисовки.
   *
   * @param {Error} error - Ошибка отрисовки
   * @returns {{hasError: boolean, error: Error}} Состояние с признаком ошибки.
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Записывает ошибку отрисовки в консоль.
   *
   * @param {Error} error - Ошибка отрисовки
   * @param {React.ErrorInfo} errorInfo - Сведения React о компоненте
   * @returns {void}
   */
  componentDidCatch(error, errorInfo) {
    console.error('=== ERROR ===');
    console.error('Message:', error.message);
    console.error('ComponentStack:', errorInfo.componentStack);
  }

  /**
   * Сбрасывает ошибку и заново отрисовывает дочерние элементы.
   *
   * @returns {void}
   */
  handleReset = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      resetKey: prev.resetKey + 1,
    }));
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <Card className={styles.card}>
            <div className={styles.icon}>⚠️</div>

            <h2 className={styles.title}>Что-то пошло не так</h2>

            <p className={styles.text}>
              Во время отображения страницы произошла ошибка.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className={styles.stack}>{this.state.error.toString()}</pre>
            )}

            <Button variant="primary" onClick={this.handleReset}>
              Попробовать снова
            </Button>
          </Card>
        </div>
      );
    }

    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}
