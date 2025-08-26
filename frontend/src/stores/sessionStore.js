// stores/sessionStore.js
// 방을 나갈때 leaveroom 이벤트 중복 호출을 막기 위한 전역 스토어
import { create } from 'zustand';

const useSessionStore = create((set) => ({
  hasLeftRoom: false,
  setHasLeftRoom: (value) => set({ hasLeftRoom: value }),
  resetSessionFlags: () => set({ hasLeftRoom: false }),
}));

export default useSessionStore;
