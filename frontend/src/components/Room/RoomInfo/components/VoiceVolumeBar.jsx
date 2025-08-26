/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import useCameraStore from '../../../../stores/cameraStore';
import styles from './VoiceVolumeBar.module.css';

const VoiceVolumeBar = ({
  height = 152,
  width = 12,
  showLabel = true,
  sensitivity = 1.0,
  className = '',
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  onVolumeChange = null, // 볼륨 변경 시 호출될 콜백
}) => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { localStream, isAudioEnabled } = useCameraStore();

  // 오디오 컨텍스트 초기화
  const initializeAudioContext = (stream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.8;

      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      setIsActive(true);
      if (onVolumeChange) {
        onVolumeChange(0, true);
      }
      startAnalyzing();
    } catch (error) {
      console.error('오디오 컨텍스트 초기화 실패:', error);
      setIsActive(false);
      if (onVolumeChange) {
        onVolumeChange(0, false);
      }
    }
  };

  // 볼륨 분석 시작
  const startAnalyzing = () => {
    const analyze = () => {
      if (!analyserRef.current || !dataArrayRef.current) {
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // 평균 볼륨 계산
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }

      const average = sum / dataArrayRef.current.length;
      // 0-100 범위로 정규화하고 민감도 적용
      const normalizedLevel = Math.min(
        100,
        (average / 128) * 100 * sensitivity
      );

      const newLevel = Math.round(normalizedLevel);
      setVolumeLevel(newLevel);
      if (onVolumeChange) {
        onVolumeChange(newLevel, isActive);
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  // 분석 중지
  const stopAnalyzing = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;
    setVolumeLevel(0);
    setIsActive(false);
  };

  // 스트림 변경 감지
  useEffect(() => {
    if (localStream && isAudioEnabled) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        initializeAudioContext(localStream);
      } else {
        stopAnalyzing();
      }
    } else {
      stopAnalyzing();
    }

    return () => {
      stopAnalyzing();
    };
  }, [localStream, isAudioEnabled]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAnalyzing();
    };
  }, []);

  // 볼륨 레벨에 따른 색상 결정
  const getVolumeColor = (level) => {
    if (level < 20) return 'var(--color-success)';
    if (level < 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const renderVolumeBar = () => {
    const isHorizontal = orientation === 'horizontal';
    const fillPercentage = volumeLevel;

    return (
      <>
        {/* 배경 바 */}
        <div
          className={styles.volumeBackground}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-input-border)',
            borderRadius: 'inherit',
          }}
        />

        {/* 활성 볼륨 바 */}
        <div
          className={styles.volumeFill}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: isHorizontal ? `${fillPercentage}%` : '100%',
            height: isHorizontal ? '100%' : `${fillPercentage}%`,
            backgroundColor: getVolumeColor(fillPercentage),
            borderRadius: 'inherit',
            transition: 'all 0.1s ease-out',
            transformOrigin: isHorizontal ? 'left' : 'bottom',
          }}
        />
      </>
    );
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      style={{
        height: `${height}px`,
        width: `${width + (showLabel ? 24 : 0)}px`,
      }}
    >
      {/* 볼륨 바 */}
      <div
        className={styles.volumeBar}
        style={{
          height: `${height}px`,
          width: `${width}px`,
        }}
      >
        {renderVolumeBar()}
      </div>
    </div>
  );
};

export default VoiceVolumeBar;
