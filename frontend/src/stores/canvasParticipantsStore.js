// src/stores/canvasParticipantsStore.js
/* eslint-disable */
import { create } from 'zustand';

const useCanvasParticipantsStore = create((set, get) => ({
  participantsState: {},

  // 개별 참가자 업데이트
  updateParticipantState: (clientId, partialState) => {
    set((state) => ({
      participantsState: {
        ...state.participantsState,
        [clientId]: {
          ...(state.participantsState[clientId] || {}),
          ...partialState,
        },
      },
    }));
  },

  // 전체 참가자 상태를 동기화 (canvas-sync 수신)
  setAllParticipantsFromSync: (participantsArray) => {
    const mapped = {};
    // /* console.log('🧩 setAllParticipantsFromSync:', participantsArray); */
    for (const p of participantsArray) {
      mapped[p.clientId] = {
        nickname: p.nickname,
        x: p.x,
        y: p.y,
        scale: p.scale,
        opacity: p.opacity,
        isHost: p.isHost,
        mode: p.mode || 1, // 배경 제거 모드 (기본값: 1)
        filter: p.filter || null, // 비디오 필터 (기본값: null)
        rotation: p.rotation || 0, // 회전 각도 (기본값: 0도)
        overlay: p.overlay || null,
        isMicOn: p.isMicOn,
      };
    }
    set({ participantsState: mapped });
  },

  // 나간 참가자 제거
  removeParticipant: (clientId) => {
    set((state) => {
      const next = { ...state.participantsState };
      delete next[clientId];
      return { participantsState: next };
    });
  },

  // 전체 초기화
  resetParticipants: () => {
    set({ participantsState: {} });
  },
}));

export default useCanvasParticipantsStore;
