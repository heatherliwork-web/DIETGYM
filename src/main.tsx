import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {userApi, foodApi, workoutApi} from './services/api';

(window as any).userApi = userApi;
(window as any).foodApi = foodApi;
(window as any).workoutApi = workoutApi;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
