// frontend/src/components/Room/PermissionPrompt/PermissionPrompt.jsx
/* eslint-disable */
import React from 'react';

export default function PermissionPrompt({
  state,
  loading,
  onRequest,
  platformHelp,
  onRefresh,
}) {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const pwaHelp = isPWA
    ? isIOS
      ? {
          os: 'iOS PWA',
          steps: [
            '설정 앱 열기',
            'Safari 선택',
            '카메라와 마이크를 "허용"으로 변경',
            '앱으로 돌아오기',
          ],
        }
      : isAndroid
        ? {
            os: 'Android PWA',
            steps: [
              '설정 앱 열기',
              '앱 → [앱 이름] 선택',
              '권한 → 카메라와 마이크를 "허용"으로 변경',
              '앱으로 돌아오기',
            ],
          }
        : platformHelp
    : platformHelp;
  React.useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        onRefresh?.();
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, [onRefresh]);
  if (loading) {
    return (
      <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]'>
        <div className='bg-white rounded-2xl p-6 w-[90%] max-w-[420px] text-center'>
          <div className='font-semibold text-lg mb-2'>권한 확인 중...</div>
          <div className='text-gray-500 text-sm'>잠시만 기다려주세요.</div>
        </div>
      </div>
    );
  }

  const denied = state.camera === 'denied' || state.microphone === 'denied';
  const prompt = state.camera === 'prompt' || state.microphone === 'prompt';

  if (!denied && !prompt) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]'>
      <div className='bg-white rounded-2xl p-6 w-[90%] max-w-[440px]'>
        <div className='font-bold text-xl mb-3'>
          카메라 · 마이크 권한이 필요해요
        </div>

        {denied ? (
          <>
            {/* <p className='text-red-600 font-semibold mb-2'>
              이전에 “거부”하셔서 브라우저가 자동으로 묻지 않아요.
            </p> */}
            <p className='text-gray-700 text-sm mb-4'>
              아래 안내대로 {pwaHelp.os}에서{' '}
              <span className='text-red-600 font-semibold'>권한</span>을 허용한
              뒤
            </p>
            <p>
              <span className='text-red-600 font-semibold'>새로고침</span>{' '}
              해주세요.
            </p>
            <br />

            <ol className='list-decimal ml-5 text-sm text-gray-600 space-y-1 mb-4'>
              {pwaHelp.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </>
        ) : (
          <>
            {/* <p className='text-gray-700 text-sm mb-4'>
              권한 요청 팝업을 띄우려면 아래 버튼을 눌러주세요.
            </p> */}
          </>
        )}

        <div className='flex gap-2'>
          {prompt && (
            <button
              onClick={onRequest}
              className='flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold'
            >
              권한 요청하기
            </button>
          )}
          <button
            onClick={onRefresh || (() => location.reload())}
            className='flex-1 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold'
          >
            권한 다시 확인
          </button>
        </div>

        {/* <div className='text-xs text-gray-400 mt-3'>
          버튼은 사용자 입력으로 인식되어야 권한 팝업이 표시됩니다.
        </div> */}
      </div>
    </div>
  );
}
