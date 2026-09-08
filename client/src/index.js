import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { store } from './app/store/store';
import reportWebVitals from './reportWebVitals';
import './shared/styles/index.css';
import { ErrorBoundary, ScrollToTop } from './shared/ui';

const root = ReactDOM.createRoot(document.getElementById('root'));
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <ErrorBoundary>
        <ScrollToTop />
        <App />
      </ErrorBoundary>
    </Provider>
  </BrowserRouter>
);

reportWebVitals();
