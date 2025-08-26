/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styles from './NicknameModal.module.css';
import Modal from '../../../../components/common/Modal/Modal';
import Button from '../../../../components/common/Button/Button';
import useUserStore from '../../../../stores/userStore';
import profaneFilter from './profaneFilter';

const NicknameModal = ({ isOpen, onClose }) => {
  const { nickname, isNicknameSet, setNickname } = useUserStore();
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [suggestedNicknames, setSuggestedNicknames] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);

  // 닉네임 유효성 검사
  const validateNickname = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return '닉네임은 최소 2자 이상이어야 합니다';
    }
    if (trimmed.length > 12) {
      return '닉네임은 최대 12자까지 가능합니다';
    }
    if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmed)) {
      return '한글, 영문, 숫자만 사용 가능합니다';
    }
    if (profaneFilter.isProfane(trimmed)) {
      return '부적절한 닉네임입니다.';
    }
    return '';
  };

  // 닉네임 입력 핸들러
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 15) {
      setNicknameInput(value);
      setNicknameError(validateNickname(value));
    }
  };

  // 닉네임 설정 완료
  const handleNicknameSubmit = () => {
    const error = validateNickname(nicknameInput);
    if (error) {
      setNicknameError(error);
      return;
    }

    if (setNickname(nicknameInput.trim())) {
      onClose();
      setNicknameError('');
      // /* console.log('👤 닉네임 설정 완료:', nicknameInput.trim()); */
    }
  };

  // 랜덤 닉네임 생성
  const generateRandomNickname = () => {
    const adjectives = [
      '귀여운',
      '멋진',
      '즐거운',
      '신비한',
      '활발한',
      '차분한',
    ];
    const nouns = ['토끼', '강아지', '고양이', '팬더', '코알라', '햄스터'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 99) + 1;
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  // 추천 닉네임 생성/재생성
  const generateSuggestedNicknames = () => {
    const newSuggestions = [1, 2, 3].map(() => generateRandomNickname());
    setSuggestedNicknames(newSuggestions);
    setSelectedSuggestionIndex(null); // 새로고침 시 선택 상태 초기화
  };

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setNicknameInput(nickname || '');
      setNicknameError('');
      setSelectedSuggestionIndex(null);
      generateSuggestedNicknames();
    }
  }, [isOpen, nickname]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isNicknameSet || onClose()}
      title='닉네임 설정'
      closeOnBackdrop={isNicknameSet}
      closeOnEscape={isNicknameSet}
      size='small'
    >
      <div className={styles.nicknameModal}>
        {/* 안내 메시지 */}
        <div className={styles.nicknameDescription}>
          <p className={styles.descText}>
            다른 참가자들에게 보여질 닉네임을 설정해주세요
          </p>
          <p className={styles.descSubtext}>
            • 2-12자 이내 • 한글, 영문, 숫자 사용 가능
          </p>
        </div>

        {/* 입력 필드 */}
        <div className={styles.inputContainer}>
          <input
            type='text'
            value={nicknameInput}
            onChange={handleNicknameChange}
            placeholder='닉네임을 입력하세요'
            className={`${styles.nicknameInput} ${nicknameError ? styles.error : ''}`}
            autoComplete='off'
            spellCheck='false'
          />
          <div className={styles.charCount}>
            <span
              className={
                nicknameInput.trim().length > 12 ? styles.overLimit : ''
              }
            >
              {nicknameInput.trim().length}
            </span>
            <span className={styles.maxLength}>/12</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {nicknameError && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {nicknameError}
          </div>
        )}

        {/* 성공 메시지 */}
        {!nicknameError && nicknameInput.trim().length >= 2 && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✅</span>
            사용 가능한 닉네임입니다
          </div>
        )}

        {/* 랜덤 닉네임 추천 */}
        <div className={styles.suggestions}>
          <div className={styles.suggestionsHeader}>
            <p className={styles.suggestionsTitle}>닉네임 추천</p>
            <button
              onClick={generateSuggestedNicknames}
              className={styles.refreshButton}
              type='button'
              title='새로운 닉네임 추천'
            >
              🔄
            </button>
          </div>
          <div className={styles.suggestionTags}>
            {suggestedNicknames.map((nickname, index) => (
              <button
                key={index}
                onClick={() => {
                  setNicknameInput(nickname);
                  setNicknameError('');
                  setSelectedSuggestionIndex(index);
                }}
                className={`${styles.suggestionTag} ${
                  selectedSuggestionIndex === index ? styles.selected : ''
                }`}
              >
                {nickname}
              </button>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.modalButtons}>
          {isNicknameSet && (
            <Button
              variant='secondary'
              size='medium'
              onClick={onClose}
              className={styles.cancelButton}
            >
              취소
            </Button>
          )}
          <Button
            variant='primary'
            size='medium'
            onClick={handleNicknameSubmit}
            disabled={!!nicknameError || nicknameInput.trim().length < 2}
            className={styles.submitButton}
          >
            {nickname ? '변경하기' : '설정하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NicknameModal;
