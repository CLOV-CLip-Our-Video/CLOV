/* eslint-disable */
// 사용자 정보 관리
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // 👤 사용자 기본 정보
      nickname: '', // 사용자 닉네임
      isNicknameSet: false, // 닉네임 설정 완료 여부

      // 🎮 사용자 설정 (UI 관련)
      preferredTheme: 'cheese', // 'cheese' | 'skyblue'
      isFirstTime: true, // 첫 방문 여부 (온보딩용)

      // 📊 사용 기록 (선택사항)
      lastVisit: null, // 마지막 방문 시간
      totalSessions: 0, // 총 세션 수

      // 👤 닉네임 관련 액션
      setNickname: (nickname) => {
        const trimmedNickname = nickname?.trim() || '';
        const isValid =
          trimmedNickname.length >= 2 && trimmedNickname.length <= 12;

        if (!isValid && trimmedNickname.length > 0) {
          /* console.warn('⚠️ 닉네임은 2-12자 사이여야 합니다:', trimmedNickname); */
          return false;
        }

        set({
          nickname: trimmedNickname,
          isNicknameSet: isValid,
        });

        // /* console.log('👤 닉네임 설정:', trimmedNickname); */
        return true;
      },

      // 🎮 테마 변경
      setTheme: (theme) => {
        if (!['cheese', 'skyblue'].includes(theme)) {
          /* console.warn('⚠️ 지원하지 않는 테마:', theme); */
          return;
        }
        set({ preferredTheme: theme });
        // /* console.log('🎨 테마 변경:', theme); */
      },

      // 📊 방문 기록 업데이트
      updateVisit: () => {
        const state = get();
        set({
          lastVisit: new Date().toISOString(),
          totalSessions: state.totalSessions + 1,
          isFirstTime: false,
        });
        // /* console.log('📊 방문 기록 업데이트'); */
      },

      // 🔄 사용자 정보 리셋 (로그아웃 등)
      resetUser: () => {
        set({
          nickname: '',
          isNicknameSet: false,
          // 테마나 방문기록은 유지
        });
        // /* console.log('🔄 사용자 정보 리셋 완료'); */
      },

      // ✅ 서버 전송 준비 체크
      isReadyForServer: () => {
        const state = get();
        return {
          hasNickname: state.isNicknameSet,
          nickname: state.nickname,
          isValid: state.isNicknameSet && state.nickname.length >= 2,
        };
      },

      // 📤 Redis 서버 전송용 데이터 생성
      getServerData: () => {
        const state = get();
        return {
          nickname: state.nickname,
          joinedAt: new Date().toISOString(),
          userAgent: navigator.userAgent.substring(0, 100), // 간단한 디바이스 정보
        };
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        nickname: state.nickname,
        isNicknameSet: state.isNicknameSet,
        preferredTheme: state.preferredTheme,
        isFirstTime: state.isFirstTime,
        lastVisit: state.lastVisit,
        totalSessions: state.totalSessions,
      }),
    }
  )
);

export default useUserStore;
