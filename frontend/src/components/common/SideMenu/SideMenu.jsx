/* eslint-disable */
import { getOverlayById, OVERLAY_ITEMS } from '../../../utils/constants';
import { useState, useEffect, useCallback } from 'react';
import { useRoomStore, useVideoEffectsStore } from '../../../stores';
import MediaSelectorVertical from '../MediaSelector/MediaSelectorVertical';
import BackgroundUploadModal from './BackgroundUploadModal';
import AIBackgroundModal from './AiBackgroundModal';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import styles from './SideMenu.module.css';
import { sendEvent } from '../../../services/socket';
import useCanvasParticipantsStore from '../../../stores/canvasParticipantsStore';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../Toast/toast';
import useCameraStore from '../../../stores/cameraStore';
import {
  getAllBackgrounds,
  changeBackground,
  getErrorMessage,
} from '@/services/apiUtils';
import {
  VIDEO_FILTERS,
  applyEffectsToCanvas,
} from '../../../utils/videoFilters';
import useCamera from '../../../hooks/useCamera';
import { safelyLeaveRoom } from '../../../utils/safelyLeaveRoom';
import { playTestToneWithAudio } from '../../../utils/deviceUtils';
import SliderBar from '../../common/SliderBar/SliderBar';
//react-icons 추가
import { HiMiniSpeakerWave } from 'react-icons/hi2';
import { FaMicrophone } from 'react-icons/fa';
import { BsBarChartFill } from 'react-icons/bs';

const SideMenu = ({ onMenuSelect, activeMenu, isMobile, onClose }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isAIModalOpen, setAIModalOpen] = useState(false); // AI 모달 상태 추가

  // Stores
  const {
    selectedFrame,
    roomBackground,
    setSelectedFrame,
    setRoomBackground,
    roomCode,
    clientId,
    participants,
    maxParticipants,
    isConnected,
    isHost,
  } = useRoomStore();

  const { participantsState, updateParticipantState } =
    useCanvasParticipantsStore();
  const {
    selectedFilter,
    setSelectedFilter,
    selectedOverlay,
    setSelectedOverlay,
  } = useVideoEffectsStore();

  const { localStream, microphoneVolume, setMicrophoneVolume } =
    useCameraStore();

  // API에서 배경 목록 가져오기
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const result = await getAllBackgrounds();

        if (result.status === 200 && result.data?.backgrounds) {
          const apiBackgrounds = result.data.backgrounds.map((bg) => ({
            id: bg.backgroundId.toString(),
            name: bg.backgroundTitle,
            preview: bg.backgroundUrl,
            type: 'background',
            backgroundUrl: bg.backgroundUrl,
          }));

          // AI 생성, 투명, 커스텀과 API 배경들을 합침
          setBackgroundItems([
            {
              id: 'ai-generate',
              name: 'AI 배경 생성',
              preview:
                'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/backgrounds/ai.png',
              type: 'ai-generate',
            }, // AI 생성 추가

            {
              id: 'custom',
              name: '커스텀 업로드',
              preview: '📁',
              type: 'upload',
            },
            // { id: 'none', name: '투명', preview: '🚫', type: 'none' },
            ...apiBackgrounds,
          ]);
          // /* console.log('배경 목록 로드 성공:', apiBackgrounds); */
        }
      } catch (error) {
        /* console.error('배경 목록 로드 실패:', error); */
        showToast('error', '배경 목록을 불러오는데 실패했습니다.', {
          duration: 2000,
          position: 'top-center',
        });
      }
    };

    fetchBackgrounds();
  }, []);
  // 로컬 상태는 UI 표시용으로만 사용
  const [selectedItems, setSelectedItems] = useState({
    filter: selectedFilter,
    background: roomBackground,
    frame: selectedFrame,
    overlay: selectedOverlay,
  });

  const menuItems = [
    { id: 'filter', icon: '✨', label: '필터' },
    { id: 'background', icon: '🎨', label: '배경' },
    { id: 'overlay', icon: '🕶️', label: '오버레이' },
    // { id: 'frame', icon: '🖼️', label: '프레임' },
    // { id: 'history', icon: '📁', label: '히스토리' },
    // { id: 'settings', icon: '⚙️', label: '설정' },
    { id: 'info', icon: 'ℹ️', label: '정보' },
  ];

  const [backgroundItems, setBackgroundItems] = useState([
    {
      id: 'ai-generate',
      name: 'AI 배경 생성',
      preview: 'AI',
      type: 'ai-generate',
    }, // AI 생성 추가
    // { id: 'none', name: '투명', preview: '🚫', type: 'none' },
    { id: 'custom', name: '커스텀 업로드', preview: '📁', type: 'upload' },
  ]);

  const frameItems = [
    { id: 'none', name: '없음', preview: '🚫', type: 'none' },
    { id: 'polaroid', name: '폴라로이드', preview: '📷', type: 'frame' },
    { id: 'vhs', name: 'VHS', preview: '📼', type: 'frame' },
    { id: 'heart', name: '하트', preview: '💖', type: 'frame' },
    { id: 'star', name: '별', preview: '⭐', type: 'frame' },
    { id: 'flower', name: '꽃', preview: '🌸', type: 'frame' },
    { id: 'retro', name: '레트로', preview: '🎮', type: 'frame' },
    { id: 'neon', name: '네온', preview: '⚡', type: 'frame' },
  ];

  // 오버레이 항목 정의
  const overlayItems = OVERLAY_ITEMS;

  // 기본값 설정 (최초 렌더링 시에만)
  if (selectedItems.filter === null) {
    setSelectedItems({
      filter: VIDEO_FILTERS[0],
      background: backgroundItems[0],
      frame: frameItems[0],
      overlay: overlayItems[0],
    });
  }

  const handleTestSpeaker = async () => {
    try {
      await playTestToneWithAudio(selectedDevices.audioOutput);

      console.log('스피커 테스트 완료');
    } catch (error) {
      console.error('스피커 테스트 실패:', error);
    }
  };

  const handleMenuClick = (menuId) => {
    if (activeMenu === menuId && (isExpanded || isMobile)) {
      setIsExpanded(false);
      onMenuSelect(null);
    } else {
      setIsExpanded(true);
      onMenuSelect(menuId);
    }
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    onMenuSelect(null);

    // 모바일에서는 사이드메뉴 자체를 닫음
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLeaveRoom = async () => {
    // 방 나가기 전에 스트림 정리
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    await safelyLeaveRoom();
    navigate('/');
  };

  // 오버레이 즉시 적용 핸들러
  const handleOverlayApply = (overlay) => {
    const overlayId = overlay?.id || 'null';
    // /* console.log(`🕶️ 오버레이 즉시 적용: ${item.name}`); */
    setSelectedItems((prev) => ({
      ...prev,
      overlay: overlayId,
    }));
    setSelectedOverlay(overlayId);

    //  WebSocket으로 상태 전송 추가
    if (clientId && roomCode) {
      const updatedState = {
        ...participantsState[clientId],
        overlay: overlayId,
      };

      updateParticipantState(clientId, updatedState);

      sendEvent('update-state', {
        roomCode,
        clientId,
        state: updatedState,
      });
    }

    applyEffectsToCanvas(document.getElementById('recording-canvas'), {
      // filter: selectedFilter,
      overlay: overlayId,
      // opacity: useVideoEffectsStore.getState().canvasOpacity,
      // size: useVideoEffectsStore.getState().canvasScale,
    });
  };

  // ✅ 필터/프레임 즉시 적용 핸들러
  const handleImmediateApply = (item, type) => {
    // /* console.log(`🎨 ${type} 즉시 적용:`, item.name); */

    // 상태 업데이트
    setSelectedItems((prev) => ({
      ...prev,
      [type]: item,
    }));

    if (type === 'filter') {
      // Zustand 스토어에 즉시 저장
      setSelectedFilter(item);
      // 캔버스에 즉시 적용
      applyItemToCanvas(item, 'filter', false);
    } else if (type === 'frame') {
      // Zustand 스토어에 즉시 저장
      setSelectedFrame(item);
      // 캔버스에 즉시 적용
      applyItemToCanvas(item, 'frame', false);
    }
  };

  // ✅ 배경 선택 핸들러 (미리보기만)
  const handleBackgroundSelect = (item) => {
    // /* console.log('🎨 배경 선택 (미리보기):', item.name); */

    // AI 생성 아이템을 선택한 경우
    if (item.type === 'ai-generate') {
      // AI 모달 열기
      setAIModalOpen(true);
      return;
    }

    // 커스텀 업로드 아이템을 선택한 경우
    if (item.type === 'upload') {
      // 업로드 모달 열기
      setUploadModalOpen(true);
      return;
    }

    // 로컬 상태 업데이트 (미리보기용)
    setSelectedItems((prev) => ({
      ...prev,
      background: item,
    }));

    // 미리보기 적용
    applyItemToCanvas(item, 'background', true);
  };

  // ✅ 배경 최종 적용 핸들러 (호스트 권한 체크 포함)
  const handleBackgroundApply = async (item) => {
    // /* console.log('🎨 배경 최종 적용 시도:', item.name); */

    // 호스트 권한 재확인 (이중 체크)
    if (!isHost) {
      showToast('error', '방장만 배경을 변경할 수 있습니다.', {
        duration: 2000,
        position: 'top-center',
      });
      return;
    }

    try {
      // Zustand 스토어에 저장
      setRoomBackground(item);

      // 캔버스에 최종 적용
      await applyItemToCanvas(item, 'background', false);

      // 성공 알림
      // showToast('success', `배경이 "${item.name}"으로 변경되었습니다.`, {
      //   duration: 2000,
      //   position: 'top-center',
      // });

      // /* console.log('✅ 배경 변경 완료'); */
    } catch (error) {
      /* console.error('❌ 배경 변경 실패:', error); */
      showToast('error', '배경 변경에 실패했습니다. 다시 시도해주세요.', {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  // ✅ 커스텀 배경 업로드 성공 핸들러
  const handleCustomBackgroundUpload = (uploadedBackground) => {
    // /* console.log('🎨 커스텀 배경 업로드 성공:', uploadedBackground); */

    // 업로드된 커스텀 배경을 현재 선택된 배경으로 설정
    const customBg = {
      id: '-1',
      name: `커스텀: ${uploadedBackground.name}`,
      preview: '🖼️',
      type: 'background',
      isCustom: true,
    };

    // 상태 업데이트
    setSelectedItems((prev) => ({
      ...prev,
      background: customBg,
    }));

    // Zustand 스토어에 저장
    setRoomBackground(customBg);

    // 캔버스에 커스텀 배경 적용 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('customBackgroundUploaded', {
        detail: {
          background: customBg,
          timestamp: Date.now(),
        },
      })
    );
  };

  // ✅ AI 생성 배경 업로드 성공 핸들러
  const handleAIBackgroundUpload = (uploadedBackground) => {
    // AI 생성된 배경을 현재 선택된 배경으로 설정
    const aiBg = {
      id: '-1',
      name: uploadedBackground.name,
      preview:
        'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/backgrounds/ai.png',
      type: 'background',
      isCustom: true,
      isAI: true,
    };

    // 상태 업데이트
    setSelectedItems((prev) => ({
      ...prev,
      background: aiBg,
    }));

    // Zustand 스토어에 저장
    setRoomBackground(aiBg);

    // 캔버스에 AI 배경 적용 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('aiBackgroundUploaded', {
        detail: {
          background: aiBg,
          timestamp: Date.now(),
        },
      })
    );
  };

  // ✅ 범용 캔버스 적용 함수
  const applyItemToCanvas = async (item, type, isPreview = false) => {
    // /* console.log(`🎨 ${type} ${isPreview ? '미리보기' : '적용'}:`, item.name); */

    const eventName = isPreview ? `${type}Preview` : `${type}Changed`;

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          [type]: item,
          isPreview,
          timestamp: Date.now(),
        },
      })
    );

    // 🎯 배경일 때만 서버에 반영
    if (
      type === 'background' &&
      !isPreview &&
      item.type === 'background' &&
      item.id !== 'custom' &&
      item.id !== 'ai-generate' &&
      item.id !== 'none' &&
      !item.isCustom && // 커스텀 배경은 이미 서버에 반영됨
      !item.isAI && // AI 배경도 이미 서버에 반영됨
      isHost
    ) {
      try {
        await changeBackground(roomCode, parseInt(item.id), clientId);
        // /* console.log('✅ 서버 배경 업데이트 완료'); */
      } catch (err) {
        /* console.error('❌ 배경 서버 반영 실패:', err); */
        showToast('error', '서버 배경 동기화에 실패했습니다.', {
          duration: 2000,
          position: 'top-center',
        });
        throw err; // 상위로 에러 전달
      }
    }
  };

  // 방 코드 복사 함수
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      showToast('success', '방 코드가 클립보드에 복사되었습니다!', {
        duration: 2000,
        position: 'top-center',
      });
    } else {
      showToast('error', '복사할 방 코드가 없습니다.', {
        duration: 1500,
        position: 'top-center',
      });
    }
  };

  const renderPanelContent = () => {
    switch (activeMenu) {
      case 'filter':
        return (
          <MediaSelectorVertical
            type='filter'
            isOpen={true}
            onClose={handleCollapse}
            items={VIDEO_FILTERS}
            selectedItem={selectedItems.filter}
            onSelectItem={(item) => handleImmediateApply(item, 'filter')}
            title='필터 선택'
            isHost={isHost}
            showApplyButton={false} // ✅ 필터는 즉시 적용
            showToast={showToast} // ✅ 토스트 함수 전달
          />
        );

      case 'background':
        return (
          <MediaSelectorVertical
            type='background'
            isOpen={true}
            onClose={handleCollapse}
            items={backgroundItems}
            selectedItem={selectedItems.background}
            onSelectItem={handleBackgroundSelect}
            onApply={handleBackgroundApply}
            isHost={isHost}
            showApplyButton={true}
            showToast={showToast}
          />
        );

      case 'overlay':
        return (
          <MediaSelectorVertical
            type='overlay'
            isOpen={true}
            onClose={handleCollapse}
            items={overlayItems}
            selectedItem={getOverlayById(selectedItems.overlay)}
            onSelectItem={handleOverlayApply}
            title='오버레이 선택'
            isHost={isHost}
            showApplyButton={false}
            showToast={showToast}
          />
        );

      case 'settings':
        return (
          <div className={styles.settingsContainer}>
            {/* <div className={styles.settingsSection}>
              <h4 className={styles.settingsTitle}>카메라 설정</h4>
              ✅ 수정: refreshDevices 대신 올바른 함수명 사용
              <select
                className={styles.settingsSelect}
                value={selectedDevices.videoInput || ''}
                onChange={(e) => selectVideoDevice(e.target.value)}
              >
                <option value='' disabled>
                  카메라 선택...
                </option>
                {devices.videoInputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `카메라 ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              {!hasVideoDevices && (
                <p className='text-sm text-[var(--color-text-secondary)] mt-2'>
                  사용 가능한 카메라가 없습니다.
                </p>
              )}
            </div> */}

            {/* 마이크 볼륨 조절 */}

            <div className={styles.settingsSection}>
              <h4 className={styles.settingsTitle}>
                <HiMiniSpeakerWave />
                스피커 설정
              </h4>
              <select
                className={styles.settingsSelect}
                value={selectedDevices.audioOutput || ''}
                onChange={(e) => selectOutputDevice(e.target.value)}
              >
                <option value='' disabled>
                  스피커 선택...
                </option>
                {devices.audioOutputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `스피커 ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              {!hasAudioDevices && (
                <p className='text-sm text-[var(--color-text-secondary)] mt-2'>
                  사용 가능한 스피커가 없습니다.
                </p>
              )}
            </div>

            <div className={styles.settingsSection}>
              <h4 className={styles.settingsTitle}>
                <FaMicrophone />
                마이크 설정
              </h4>
              <select
                className={styles.settingsSelect}
                value={selectedDevices.audioInput || ''}
                onChange={(e) => selectAudioDevice(e.target.value)}
              >
                <option value='' disabled>
                  마이크 선택...
                </option>
                {devices.audioInputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `마이크 ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              {!hasAudioDevices && (
                <p className='text-sm text-[var(--color-text-secondary)] mt-2'>
                  사용 가능한 마이크가 없습니다.
                </p>
              )}
            </div>

            <div className={styles.settingsSection}>
              <h4 className={styles.settingsTitle}>
                <BsBarChartFill />
                마이크 볼륨
              </h4>
              <SliderBar
                min={0}
                max={100}
                step={1}
                value={microphoneVolume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  setMicrophoneVolume(newVolume);

                  // 🔧 실제 마이크 볼륨 적용
                  applyMicrophoneVolume(newVolume);
                }}
                label='볼륨'
                unit='%'
              />
              <div className='text-xs text-[var(--color-text-secondary)] mt-1'>
                마이크 입력 볼륨을 조절합니다 (0% = 음소거, 100% = 최대)
              </div>
            </div>

            {/* 디바이스 새로고침 버튼 추가 */}
            <div className={styles.settingsSection}>
              <button
                onClick={refreshDevices}
                className={`${styles.serviceButton} ${styles.primary}`}
              >
                디바이스 목록 새로고침
              </button>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className={styles.infoContainer}>
            <div className={styles.infoSection}>
              <h4 className={styles.infoTitle}>서비스 정보</h4>
              <div className='space-y-3'>
                <div className={styles.serviceCard}>
                  <div className={styles.serviceLogo}>CLOV</div>
                  <div className={styles.serviceName}>
                    CLip Our Video v1.0.0
                  </div>
                  <div className={styles.serviceCopyright}>
                    © 2025 CLOV Team
                  </div>
                </div>

                <div className={styles.serviceButtons}>
                  <button
                    className={`${styles.serviceButton} ${styles.primary}`}
                    onClick={() => {
                      const newWindow = window.open(
                        'https://forms.gle/Tz1dD67ExXELqGLt9',
                        '_blank'
                      );
                      if (newWindow) {
                        newWindow.opener = null; // 보안 강화
                      }
                    }}
                  >
                    📧 문의하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className='flex items-center justify-center h-full'>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              메뉴를 선택해주세요
            </span>
          </div>
        );
    }
  };

  // 🆕 마이크 볼륨 적용 함수 추가
  const applyMicrophoneVolume = useCallback(
    (volume) => {
      try {
        // localStream 사용 (전역 상태)
        if (!localStream) {
          console.warn(
            '❌ localStream이 없어서 마이크 볼륨을 적용할 수 없습니다'
          );
          showToast('warning', '먼저 카메라를 켜주세요.', {
            duration: 2000,
            position: 'top-center',
          });
          return;
        }

        const audioTracks = localStream.getAudioTracks();

        if (audioTracks.length === 0) {
          console.warn(
            '❌ 오디오 트랙이 없어서 마이크 볼륨을 적용할 수 없습니다'
          );
          showToast('warning', '마이크가 연결되지 않았습니다.', {
            duration: 2000,
            position: 'top-center',
          });
          return;
        }

        // 볼륨을 0-1 범위로 변환
        const normalizedVolume = volume / 100;

        audioTracks.forEach((track) => {
          if (volume === 0) {
            track.enabled = false;
          } else {
            track.enabled = true;
          }
        });

        // 성공 토스트
        if (volume === 0) {
          showToast('success', '마이크가 음소거되었습니다.', {
            duration: 1500,
            position: 'top-center',
          });
        }
        // } else {
        //   showToast('success', `마이크 볼륨: ${volume}%`, {
        //     duration: 1500,
        //     position: 'top-center',
        //   });
        // }

        console.log(`✅ 마이크 볼륨 적용: ${volume}%`);
      } catch (error) {
        console.error('❌ 마이크 볼륨 적용 실패:', error);
        showToast('error', '마이크 볼륨 조절에 실패했습니다.', {
          duration: 2000,
          position: 'top-center',
        });
      }
    },
    [localStream, showToast]
  );

  return (
    <div className={styles.container}>
      {/* 메인 사이드바 (항상 보임) */}
      <div className={styles.mainSidebar}>
        {/* <button onClick={handleTestSpeaker}>🔊 스피커 테스트</button> */}
        {/* 로고/타이틀 영역 */}
        {/* <div
          className={styles.logoSection}
          onClick={() => setModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.logo}>C</div>
        </div> */}

        {/* 메뉴 아이템들 */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`${styles.menuItem} ${
                activeMenu === item.id && (isExpanded || isMobile)
                  ? styles.active
                  : ''
              }`}
              title={item.label}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 하단 접기 버튼 영역 (항상 공간 유지) */}
        <div className={styles.collapseSection}>
          {isExpanded && (
            <button onClick={handleCollapse} className={styles.collapseButton}>
              <span>←</span>
            </button>
          )}
        </div>
      </div>

      {/* 확장 패널 (오버레이 방식) */}
      {((isExpanded && activeMenu) || (isMobile && activeMenu)) && (
        <>
          {/* 반투명 배경 (데스크톱에서만) */}
          {!isMobile && (
            <div className={styles.overlay} onClick={handleCollapse} />
          )}

          {/* 확장 패널 */}
          <div
            className={`${styles.expandedPanel} ${isExpanded || isMobile ? styles.open : ''}`}
          >
            {/* 패널 헤더 */}
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                {menuItems.find((item) => item.id === activeMenu)?.icon}{' '}
                {menuItems.find((item) => item.id === activeMenu)?.label}
              </h3>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer transition-colors ${styles.closeButton}`}
                onClick={handleCollapse}
              >
                ✕
              </button>
            </div>

            {/* 패널 내용 */}
            <div className={styles.panelContent}>{renderPanelContent()}</div>
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h2 className='text-xl font-bold mb-2'>
          {isHost ? '방장님, 정말 나가시겠어요?' : '정말 나가시겠어요?'}
        </h2>
        <p className='text-[var(--color-text-secondary)]'>
          {isHost
            ? '방장이 방에서 나가면 방이 종료됩니다.'
            : '녹화실을 나가면 방에서 퇴장하게 됩니다.'}
        </p>
        <div className='flex mt-4 justify-center'>
          <Button
            onClick={() => setModalOpen(false)}
            className='flex-1 text-sm py-2 px-4 rounded transition-colors mx-1'
            variant='primary'
          >
            {isHost ? '방 유지하기' : '계속 놀기'}
          </Button>
          <Button
            onClick={handleLeaveRoom}
            className='flex-1 text-sm py-2 px-4 rounded transition-colors mx-1'
            variant='danger'
          >
            방 나가기
          </Button>
        </div>
      </Modal>

      {/* 배경 업로드 모달 */}
      <BackgroundUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        roomCode={roomCode}
        onUploadSuccess={handleCustomBackgroundUpload}
        isHost={isHost}
      />

      {/* AI 배경 생성 모달 */}
      <AIBackgroundModal
        isOpen={isAIModalOpen}
        onClose={() => setAIModalOpen(false)}
        roomCode={roomCode}
        onUploadSuccess={handleAIBackgroundUpload}
        isHost={isHost}
      />
    </div>
  );
};

export default SideMenu;
