/* eslint-disable */
import React, { useState } from 'react';
import styles from './ParticipantList.module.css';
import useCanvasParticipantsStore from '../../../stores/canvasParticipantsStore';
import useRoomStore from '../../../stores/roomStore';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaCrown,
  FaVolumeMute,
  FaVolumeUp,
} from 'react-icons/fa';
import { showToast } from '../../common/Toast/toast';

const ParticipantList = () => {
  const clientId = useRoomStore((state) => state.clientId);
  const rawParticipants = useCanvasParticipantsStore(
    (state) => state.participantsState
  );

  // 개별 참가자 음소거 상태 관리
  const [mutedParticipants, setMutedParticipants] = useState(new Set());

  const participants = Object.entries(rawParticipants).map(([clientId, p]) => ({
    id: clientId,
    nickname: p.nickname,
    isHost: p.isHost,
    isConnected: true,
    isMicOn: p.isMicOn,
    isMutedByMe: mutedParticipants.has(clientId),
  }));

  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // 개별 참가자 음소거/해제 핸들러
  const toggleParticipantMute = (participantId, participantNickname) => {
    const newMutedParticipants = new Set(mutedParticipants);

    if (mutedParticipants.has(participantId)) {
      // 음소거 해제
      newMutedParticipants.delete(participantId);
      setMutedParticipants(newMutedParticipants);

      // 실제 오디오 음소거 해제
      muteParticipantAudio(participantId, false);

      showToast(
        'success',
        `${participantNickname}님의 소리를 다시 들을 수 있습니다.`,
        {
          duration: 2000,
          position: 'top-center',
        }
      );
    } else {
      // 음소거
      newMutedParticipants.add(participantId);
      setMutedParticipants(newMutedParticipants);

      // 실제 오디오 음소거
      muteParticipantAudio(participantId, true);

      showToast('info', `${participantNickname}님의 소리를 음소거했습니다.`, {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  // 🔍 모든 원격 비디오 엘리먼트 찾기 (여러 방법 시도)
  const findRemoteVideoElement = (participantId) => {
    console.log(`🔍 참가자 ${participantId}의 비디오 엘리먼트 찾는 중...`);

    // 방법 1: data-attribute로 찾기
    let element = document.querySelector(
      `[data-participant-id="${participantId}"]`
    );
    if (element) {
      console.log(`✅ 방법 1 성공: data-attribute로 찾음`);
      return element;
    }

    // 방법 2: 모든 video 엘리먼트 검사
    const allVideos = document.querySelectorAll('video');
    console.log(
      `🎥 전체 비디오 엘리먼트 ${allVideos.length}개 발견:`,
      allVideos
    );

    allVideos.forEach((video, index) => {
      console.log(`비디오 ${index}:`, {
        src: video.src,
        srcObject: !!video.srcObject,
        hasAudioTracks: video.srcObject?.getAudioTracks().length || 0,
        muted: video.muted,
        id: video.id,
        className: video.className,
        'data-participant-id': video.getAttribute('data-participant-id'),
      });
    });

    // 방법 3: 전역 remoteVideoElements 접근 시도
    if (
      window.remoteVideoElements &&
      window.remoteVideoElements[participantId]
    ) {
      console.log(`✅ 방법 3 성공: 전역 객체에서 찾음`);
      return window.remoteVideoElements[participantId];
    }

    console.log(`❌ 참가자 ${participantId}의 비디오 엘리먼트를 찾을 수 없음`);
    return null;
  };

  // 🔧 개선된 음소거 함수
  const muteParticipantAudio = (participantId, shouldMute) => {
    console.log(`🔊 음소거 시도: ${participantId}, shouldMute: ${shouldMute}`);

    try {
      const remoteVideoElement = findRemoteVideoElement(participantId);

      if (remoteVideoElement && remoteVideoElement.srcObject) {
        const stream = remoteVideoElement.srcObject;
        const audioTracks = stream.getAudioTracks();

        console.log(`🎵 오디오 트랙 ${audioTracks.length}개 발견`);

        if (audioTracks.length === 0) {
          console.warn(`⚠️ 참가자 ${participantId}에게 오디오 트랙이 없습니다`);
          return false;
        }

        // 방법 1: 트랙 레벨에서 비활성화
        audioTracks.forEach((track, index) => {
          const beforeState = track.enabled;
          track.enabled = !shouldMute;
          console.log(`🎵 트랙 ${index}: ${beforeState} -> ${track.enabled}`);
        });

        // 방법 2: 엘리먼트 레벨에서도 음소거
        remoteVideoElement.muted = shouldMute;
        console.log(`🔇 비디오 엘리먼트 muted: ${remoteVideoElement.muted}`);

        // 방법 3: 볼륨 조절
        remoteVideoElement.volume = shouldMute ? 0 : 1;
        console.log(`🔊 볼륨 설정: ${remoteVideoElement.volume}`);

        console.log(`✅ ${participantId} 음소거 처리 완료`);

        // 상태 재확인
        setTimeout(() => {
          const recheck = findRemoteVideoElement(participantId);
          if (recheck) {
            console.log(`🔍 재확인 결과:`, {
              muted: recheck.muted,
              volume: recheck.volume,
              audioTracksEnabled: recheck.srcObject
                ?.getAudioTracks()
                .map((t) => t.enabled),
            });
          }
        }, 500);

        return true;
      } else {
        console.warn(
          `⚠️ 참가자 ${participantId}의 비디오 엘리먼트 또는 스트림을 찾을 수 없음`
        );

        // 전역 이벤트로 다시 시도
        console.log(`🌐 전역 이벤트로 재시도...`);
        window.dispatchEvent(
          new CustomEvent('participant-mute-toggle', {
            detail: { participantId, shouldMute },
          })
        );

        return false;
      }
    } catch (error) {
      console.error('❌ 음소거 처리 중 오류:', error);
      return false;
    }
  };

  // 🆕 전체 상태 확인 함수 (개발용)
  const debugAllParticipants = () => {
    console.log('🐛 === 전체 참가자 상태 확인 ===');

    Object.entries(rawParticipants).forEach(([clientId, participant]) => {
      console.log(`👤 참가자 ${participant.nickname} (${clientId}):`);
      const videoElement = findRemoteVideoElement(clientId);

      if (videoElement) {
        console.log(`  ✅ 비디오 엘리먼트 발견`);
        console.log(`  🔇 muted: ${videoElement.muted}`);
        console.log(`  🔊 volume: ${videoElement.volume}`);
        console.log(
          `  🎵 오디오 트랙:`,
          videoElement.srcObject?.getAudioTracks().map((t) => ({
            id: t.id,
            enabled: t.enabled,
            readyState: t.readyState,
          }))
        );
      } else {
        console.log(`  ❌ 비디오 엘리먼트 없음`);
      }
    });
  };

  return (
    <div
      className='mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden'
      style={{
        backgroundColor: 'var(--color-card-background)',
        borderColor: 'var(--border-color-default)',
      }}
    >
      <div
        className='flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors'
        style={{ backgroundColor: 'var(--color-background)' }}
        onClick={toggleExpanded}
      >
        <h4
          className='text-sm font-semibold m-0'
          style={{ color: 'var(--color-text)' }}
        >
          참여자 ({participants.length})
        </h4>
        <span
          className={`text-xs transition-transform ${styles.toggleIcon} ${isExpanded ? styles.expanded : ''}`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ▼
        </span>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden border-t ${
          isExpanded ? 'max-h-[300px]' : 'max-h-0'
        }`}
        style={{ borderColor: 'var(--border-color-default)' }}
      >
        <div className='overflow-y-auto max-h-[300px] scroll-pb-4'>
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center gap-2 p-3 border-b last:border-b-0 transition-colors ${styles.participantHover}`}
              style={{ borderColor: 'var(--border-color-default)' }}
            >
              <div
                className='w-2 h-2 rounded-full flex-shrink-0'
                style={{
                  backgroundColor: participant.isConnected
                    ? 'var(--color-connection-good)'
                    : 'var(--color-connection-bad)',
                }}
              />
              <span
                className={`text-xs font-medium flex-grow ${
                  participant.isMutedByMe ? styles.mutedByMe : ''
                }`}
                style={{ color: 'var(--color-text)' }}
              >
                {participant.nickname}
                {/* 🆕 자기 자신 표시 */}
                {participant.id === clientId && (
                  <span
                    className='ml-1 text-xs'
                    style={{ color: 'var(--color-text-light)' }}
                  >
                    (나)
                  </span>
                )}
              </span>
              {participant.isHost && (
                <span className='text-sm flex-shrink-0'>
                  <FaCrown color='var(--color-primary)' />
                </span>
              )}
              {participant.isMicOn ? (
                <span className='text-sm flex-shrink-0'>
                  <FaMicrophone />
                </span>
              ) : (
                <span className='text-sm flex-shrink-0'>
                  <FaMicrophoneSlash color='var(--color-mic-off)' />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;
