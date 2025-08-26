/* eslint-disable */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useVideoEffectsStore = create(
  persist(
    (set, get) => ({
      // 🎨 필터 관련 상태
      selectedFilter: { id: 'none', name: '원본', preview: '🎨', type: 'none' }, // 현재 선택된 필터 객체 (기본값: 원본)

      // 👻 캔버스 투명도 (RecordingRoom에서 배경이 비치도록)
      canvasOpacity: 100, // 0-100: 캔버스 자체의 투명도

      // 📏 캔버스 크기 (RecordingRoom에서 크기 조절용)
      canvasScale: 100, // 50-200: 캔버스 크기 배율

      // 🕶️ 오버레이 관련 상태
      selectedOverlay: 'none', // 현재 선택된 오버레이 id


      // 🎨 필터 관련 액션
      setSelectedFilter: (filter) => {
        set({ selectedFilter: filter });
        // /* console.log('🎨 필터 변경:', filter?.name || '없음'); */
      },

      // 👻 캔버스 투명도 조절 (RecordingRoom용)
      setCanvasOpacity: (opacity) => {
        const normalizedOpacity = Math.max(0, Math.min(100, opacity));
        set({ canvasOpacity: normalizedOpacity });
        // /* console.log('👻 캔버스 투명도 변경:', normalizedOpacity + '%'); */
      },

      // 📏 캔버스 크기 조절 (RecordingRoom용)
      setCanvasScale: (scale) => {
        const normalizedScale = Math.max(50, Math.min(200, scale));
        set({ canvasScale: normalizedScale });
        // /* console.log('📏 캔버스 크기 변경:', normalizedScale + '%'); */
      },
            // 🕶️ 오버레이 선택 액션
      setSelectedOverlay: (overlay) => {
        set({ selectedOverlay: overlay });
      },
        // /* console.log('🕶️ 오버레이 변경:', overlay?.name || '없음'); */


      // 🔄 설정 리셋
      resetEffects: () => {
        set({
          selectedFilter: { id: 'none', name: '원본', preview: '🎨', type: 'none' },
          canvasOpacity: 100,
          canvasScale: 100,
          selectedOverlay: { id: 'none', name: '없음', preview: '🚫', type: 'none' }, 
        });
        // /* console.log('🔄 비디오 이펙트 설정 리셋 완료'); */
      },

      // 📊 현재 설정 요약
      getEffectsSummary: () => {
        const state = get();
        return {
          filter: state.selectedFilter?.name || 'none',
          canvasOpacity: state.canvasOpacity + '%',
          canvasScale: state.canvasScale + '%',
          overlay: state.selectedOverlay?.name || 'none',
        };
      },

      // ✅ RecordingRoom 전환 준비 체크
      isReadyForRecording: () => {
        const state = get();
        return {
          hasValidOpacity:
            state.canvasOpacity >= 0 && state.canvasOpacity <= 100,
          hasValidScale: state.canvasScale >= 50 && state.canvasScale <= 200,
          isReady: true, // 기본적으로 항상 준비됨
        };
      },
    }),
    {
      name: 'video-effects-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedFilter: state.selectedFilter,
        canvasOpacity: state.canvasOpacity,
        canvasScale: state.canvasScale,
      }),
    }
  )
);

export default useVideoEffectsStore;