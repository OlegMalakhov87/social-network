import { Component } from 'react';
import { Button, Card } from '..';
import styles from './ErrorBoundary.module.css';

/**
 * Компонент-перехватчик ошибок React.
 *
 * Перехватывает ошибки рендера дочерних компонентов
 * и отображает запасной интерфейс вместо падения всего приложения.
 *
 * Не перехватывает:
 * - ошибки в async функциях
 * - ошибки в обработчиках событий
 * - ошибки запросов fetch/axios
 *
 * @extends Component
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Обновление состояния после возникновения ошибки.
   *
   * @param {Error} error
   * @returns {{hasError:boolean,error:Error}}
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Логирование ошибки.
   *
   * Здесь позже можно подключить Sentry,
   * LogRocket или собственный backend.
   *
   * @param {Error} error
   * @param {React.ErrorInfo} errorInfo
   */
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error);
    console.error(errorInfo);
  }

  /**
   * Сброс ошибки.
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
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

    return this.props.children;
  }
}
