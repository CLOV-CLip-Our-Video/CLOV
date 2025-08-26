/* eslint-disable */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCameraStore = create(
  persist(
    (set, get) => ({
      // 상태
      isVideoEnabled: true,
      isAudioEnabled: true,
      localStream: null,
      processedStream: null, // AI 후처리된 스트림
      remoteStreams: {},
      transparency: 100,
      size: 100,
      rotation: 0, // 회전 각도 (0-359도)
      cameraMode: 1, // FULL = 1, PERSON_ONLY = 2, FACE_ONLY = 3
      microphoneVolume: 100, // 0-100 범위

      // 마이크 입력과 오디오 출력 디바이스 유지 (카메라 입력 디바이스만 제거)
      selectedAudioDevice: '', // ✅ 마이크 입력 유지
      selectedOutputDevice: '', // ✅ 오디오 출력 유지

      // 액션
      setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
      setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
      setLocalStream: (stream) => set({ localStream: stream }),
      setProcessedStream: (stream) => set({ processedStream: stream }),
      setTransparency: (value) => set({ transparency: value }),
      setSize: (value) => set({ size: value }),
      setRotation: (value) => set({ rotation: value }),
      setCameraMode: (mode) => set({ cameraMode: mode }),
      setMicrophoneVolume: (volume) => set({ microphoneVolume: volume }),

      // 마이크 입력과 오디오 출력 디바이스
      setSelectedAudioDevice: (deviceId) =>
        set({ selectedAudioDevice: deviceId }), // ✅ 마이크 입력 유지
      setSelectedOutputDevice: (deviceId) =>
        set({ selectedOutputDevice: deviceId }), // ✅ 오디오 출력 유지
    }),
    {
      name: 'camera-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isVideoEnabled: state.isVideoEnabled,
        isAudioEnabled: state.isAudioEnabled,
        transparency: state.transparency,
        size: state.size,
        rotation: state.rotation,
        cameraMode: state.cameraMode,
        microphoneVolume: state.microphoneVolume,
        // processedStream은 persist에서 제외 (MediaStream 객체는 직렬화 불가)
        selectedAudioDevice: state.selectedAudioDevice, // ✅ 마이크 입력 유지
        selectedOutputDevice: state.selectedOutputDevice, // ✅ 오디오 출력 유지
      }),
    }
  )
);

export default useCameraStore;
