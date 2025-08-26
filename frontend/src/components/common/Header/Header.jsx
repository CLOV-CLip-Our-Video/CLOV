import { Link } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

/**
 * 공통 Header 컴포넌트 (MVP용)
 *
 * - 현재는 메뉴 링크가 설정되지 않았으며, 추후 라우팅 구성 시 `to` 경로만 채워주면 됨
 * - 기본 레이아웃과 스타일만 포함됨
 */

export default function Header() {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleConfirm = () => {
    /* console.log('예 누름'); */
    setModalOpen(false);
  };

  return (
    <>
      <header
        className='
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-8 py-5
        shadow-[var(--shadow-card)]
        bg-[var(--color-card-background)]
        rounded-b-[var(--border-radius-medium)]
      '
      >
        {/* 로고 */}
        <h1 className='text-2xl font-extrabold tracking-wide'>
          <Link
            to='/'
            className='text-[var(--color-primary)] hover:opacity-80 transition'
            style={{ textShadow: 'var(--shadow-button)' }}
          >
            로고
          </Link>
        </h1>

        {/* 메뉴 */}
        <nav>
          <ul className='flex gap-6 text-[var(--color-text)] text-lg'>
            <li>
              <Link
                to='/'
                className='hover:text-[var(--color-primary)] hover:underline underline-offset-4 transition-colors font-medium'
              >
                홈
              </Link>
            </li>
            <li>
              <button
                onClick={() => setModalOpen(true)}
                className='hover:text-[var(--color-primary)] hover:underline underline-offset-4 transition-colors font-medium'
              >
                모달 테스트
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h2 className='text-xl font-bold mb-2'>서비스 소개</h2>
        <p className='text-[var(--color-text-secondary)] mb-3'>
          모이고, 찍고, 공유 하세요!
        </p>
        <div className='grid grid-cols-2 gap-2'>
          <Button variant='primary' onClick={handleConfirm} className='w-full'>
            예
          </Button>
          <Button
            variant='secondary'
            onClick={() => setModalOpen(false)}
            className='w-full'
          >
            아니오
          </Button>
        </div>
      </Modal>
    </>
  );
}
