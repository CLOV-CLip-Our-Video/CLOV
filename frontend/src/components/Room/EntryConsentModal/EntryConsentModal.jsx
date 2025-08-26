/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';

export default function EntryConsentModal({ isOpen, onAgree, onDecline }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onAgree();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onAgree]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline} // 외부에서 닫기 불가
      showCloseButton={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      title='잠깐만요!'
      size='medium'
    >
      <div className='text-[var(--color-text)] text-sm leading-relaxed'>
        <p className='mb-3'>
          이 서비스에서는{' '}
          <strong>영상과 배경이 실시간으로 다른 참가자들과 공유</strong>됩니다.
        </p>
        <p className='mb-3'>
          모두가 즐겁게 사용할 수 있도록,{' '}
          <strong>보기 불편한 이미지나 표현</strong>은 삼가주세요.
        </p>
        <p className='mb-6'>
          <strong>이용 약속에 동의해 주시면 방에 입장하실 수 있습니다.</strong>
        </p>

        <div className='flex gap-2'>
          <Button
            onClick={onDecline}
            className='flex-1 py-2 px-4 rounded-xl text-sm font-medium'
            variant='secondary'
          >
            돌아가기
          </Button>
          <Button
            onClick={onAgree}
            className='flex-1 py-2 px-4 rounded-xl text-sm font-medium'
            variant='primary'
          >
            동의하고 입장하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
