import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkRoomValidity, getErrorMessage } from '../../../services/apiUtils';
import { showToast } from '../../../components/common/Toast/toast';

export const useRoomActions = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateConsent, setShowCreateConsent] = useState(false);
  const [showJoinConsent, setShowJoinConsent] = useState(false);

  const handleCreateClick = () => {
    sessionStorage.setItem('entryType', 'create');
    setShowCreateConsent(true);
  };

  const handleJoinClick = async () => {
    if (!roomCode.trim()) {
      alert('방 코드를 입력해주세요.');
      return;
    }

    if (roomCode.length !== 6) {
      alert('올바른 방 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await checkRoomValidity(roomCode);
      sessionStorage.setItem('entryType', 'join');
      sessionStorage.setItem('roomCode', roomCode);
      setShowJoinConsent(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showToast('error', '유효하지 않은 방 코드입니다.', {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinClick();
    }
  };

  const handleCreateAgree = () => {
    setShowCreateConsent(false);
    navigate('/waiting/createroom');
  };

  const handleJoinAgree = () => {
    setShowJoinConsent(false);
    const savedRoomCode = sessionStorage.getItem('roomCode');
    navigate(`/waiting/${savedRoomCode}`);
  };

  return {
    roomCode,
    setRoomCode,
    isLoading,
    showCreateConsent,
    setShowCreateConsent,
    showJoinConsent,
    setShowJoinConsent,
    handleCreateClick,
    handleJoinClick,
    handleKeyPress,
    handleCreateAgree,
    handleJoinAgree,
  };
};
