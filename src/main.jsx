import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { store, persistor } from './redux/store.js';
import './index.scss';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
