/* eslint-disable */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header/Header';
import { Toaster } from 'react-hot-toast';

// 페이지 컴포넌트 import
import LandingPage from './pages/LandingPage/LandingPage';
import WaitingRoom from './pages/WaitingRoom/WaitingRoom';
import RecordingRoom from './pages/RecordingRoom/RecordingRoom';
import NotFound from './pages/ErrorPage/NotFound';

// App.jsx에 임시로 추가 (개발용)
// import APITestPanel from './components/dev/APITestPanel';
// import QuickAPITest from './components/dev/QuickAPITest';

function App() {
  return (
    <div className='App'>
      {/* <Header /> */}
      <Toaster
        position='top-center' // 기본 위치
        toastOptions={{
          // 전역 최소 스타일만 정의 (나머진 toast.js에서 세부 지정)
          style: {
            fontSize: '0.875rem',
            borderRadius: '8px',
          },
        }}
      />
      <Routes>
        {/* 메인 랜딩 페이지 */}
        <Route path='/' element={<LandingPage />} />

        {/* 대기실 이전*/}
        <Route path='/waiting/:roomId' element={<WaitingRoom />} />

        {/* (구)대기실 - 방 코드로 입장 */}
        {/* <Route path='/waiting/:roomId' element={<WaitingRoom />} /> */}

        {/* 녹화실 - 실제 녹화가 이루어지는 공간 */}
        {/* /room/:roomId - 일반 녹화실 */}
        {/* /room/:roomId?showSave=true - 저장 모달이 열린 상태 */}
        <Route path='/room/:roomId' element={<RecordingRoom />} />

        {/* 404 에러 페이지 */}
        {/* <Route path='*' element={<NotFound />} /> */}
      </Routes>
      {/* 개발환경에서만 API 테스트 패널 표시 */}
      {/* {import.meta.env.DEV && <QuickAPITest />} */}
    </div>
  );
}

export default App;
