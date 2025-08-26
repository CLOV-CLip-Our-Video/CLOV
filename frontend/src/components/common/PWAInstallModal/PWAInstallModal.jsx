import React from 'react';
import Modal from '../Modal/Modal';

/**
 * iOS Safari에서 PWA 설치 방법을 안내하는 모달
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 함수
 */
const PWAInstallModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-sm mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📱</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            CLOV 앱 설치하기
          </h2>
          <p className="text-sm text-gray-600">
            CLOV를 홈 화면에 추가하여<br />
            앱처럼 편리하게 사용하세요!
          </p>
        </div>

        {/* 설치 단계 */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Safari 하단의 <span className="font-bold">공유 버튼 (📤)</span>을 탭하세요
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-bold">"홈 화면에 추가"</span>를 선택하세요
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-bold">"추가"</span>를 탭하여 CLOV 앱을 설치하세요
              </p>
            </div>
          </div>
        </div>

        {/* 장점 안내 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-gray-800 mb-2">
            ✨ 앱으로 설치하면 좋은 점
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 홈 화면에서 바로 실행</li>
            <li>• 전체화면으로 더 넓은 화면</li>
            <li>• 빠른 로딩 속도</li>
            <li>• 네이티브 앱 같은 사용감</li>
          </ul>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          확인
        </button>
      </div>
    </Modal>
  );
};

export default PWAInstallModal;