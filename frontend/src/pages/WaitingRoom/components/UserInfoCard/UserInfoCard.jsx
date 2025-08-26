/* eslint-disable */
import React from 'react';
import styles from './UserInfoCard.module.css';
import Button from '../../../../components/common/Button/Button';
import useUserStore from '../../../../stores/userStore';

const UserInfoCard = ({ onEditClick }) => {
  const { nickname, isNicknameSet } = useUserStore();

  return (
    <div className={styles.userCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>사용자 정보</h3>
        <Button
          variant='outline'
          size='small'
          onClick={onEditClick}
          className={styles.editButton}
        >
          수정
        </Button>
      </div>
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>👤</div>
        <div className={styles.userDetails}>
          <h4 className={styles.userName}>{nickname || '닉네임 없음'}</h4>
          <p className={styles.userStatus}>
            {isNicknameSet ? '✅ 준비 완료' : '⚠️ 닉네임 설정 필요'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;