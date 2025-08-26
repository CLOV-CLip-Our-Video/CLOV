/* eslint-disable react/prop-types */
import React from 'react';
import Modal from '../../../common/Modal/Modal';
import useCanvasParticipantsStore from '../../../../stores/canvasParticipantsStore';

const AssignHostModal = ({ isOpen, onClose, onAssign, currentClientId }) => {
  const participants = useCanvasParticipantsStore((s) => s.participantsState);

  const candidates = Object.entries(participants)
    .filter(([id]) => id !== currentClientId)
    .map(([id, info]) => ({ clientId: id, nickname: info.nickname }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className='text-lg font-bold mb-2'>방장 위임</h2>
      <p className='text-sm text-gray-600 mb-4'>
        아래 목록에서 새로운 방장을 선택하세요.
      </p>
      <div className='space-y-2 max-h-[200px] overflow-y-auto'>
        {candidates.map((user) => (
          <button
            key={user.clientId}
            onClick={() => onAssign(user.clientId)}
            className='w-full text-left px-4 py-2 rounded hover:bg-gray-100 border border-gray-200'
          >
            {user.nickname}
          </button>
        ))}
        {candidates.length === 0 && (
          <div className='text-sm text-gray-500'>
            위임할 수 있는 참가자가 없습니다.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AssignHostModal;
