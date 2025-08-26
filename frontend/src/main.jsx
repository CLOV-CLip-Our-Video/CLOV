// import { StrictMode } from 'react'; // 일시적으로 비활성화

// 빌드 ID 변경 시 localStorage 초기화 및 buildId 저장
if (localStorage.getItem('buildId') !== __BUILD_ID__) {
  localStorage.clear();
  localStorage.setItem('buildId', __BUILD_ID__);
}

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* StrictMode 일시적으로 비활성화 - React 19 상태 업데이트 문제 해결용 */}
    {/* <StrictMode> */}
    <App />
    {/* </StrictMode> */}
  </BrowserRouter>
);
