/* eslint-disable */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllBackgrounds, changeBackground, getErrorMessage } from '@/services/apiUtils';

const useRoomStore = create(
  persist(
    (set, get) => ({
      // 🟢 기존 상태 (유지)
      roomCode: null,
      participants: [],
      isHost: false,
      maxParticipants: 4,

      // 필터/배경/프레임 상태
      selectedFrame: null,
      selectedFilter: null,
      roomBackground: null,

      // // 필터 강도 및 설정(미사용)
      // filterIntensity: 100,        // 필터 강도 (0-100)
      // backgroundOpacity: 100,      // 배경 투명도 (0-100)
      // frameOpacity: 100,           // 프레임 투명도 (0-100)

      // 적용 상태 추적
      isFilterApplied: false,
      isBackgroundApplied: false,
      isFrameApplied: false,

      // Socket 연결 관련 상태
      isConnected: false, // WebSocket 연결 상태
      isConnecting: false, // 연결 시도 중인지
      socketError: null, // Socket 에러 메시지
      clientId: null, // 내 고유 ID (백엔드에서 받음)

      // 실시간 상태 관련
      // 이관 to canvasParticipantsStore
      // participantPositions: {}, // { clientId: { x, y, scale, opacity } } 형태
      isRecording: false, // 현재 녹화 중인지
      countdown: null, // 카운트다운 숫자 (3, 2, 1, null)

      // 배경 관련 상태
      availableBackgrounds: [], // 사용 가능한 배경 목록
      isLoadingBackgrounds: false, // 배경 목록 로딩 중인지
      backgroundError: null, // 배경 관련 에러

      // 🟢 기존 액션 (유지)
      setRoomCode: (code) => set({ roomCode: code }),
      setParticipants: (participants) => set({ participants }),
      setIsHost: (isHost) => set({ isHost }),
      setMaxParticipants: (max) => set({ maxParticipants: max }),

      // 필터/배경/프레임 액션 (수정 및 추가)
      setSelectedFrame: (frame) => {
        /* console.log('🖼️ Store: 프레임 설정됨', frame); */
        set({
          selectedFrame: frame,
          isFrameApplied: frame && frame.id !== 'none',
        });
      },

      setSelectedFilter: (filter) => {
        /* console.log('🎨 Store: 필터 설정됨', filter); */
        set({
          selectedFilter: filter,
          isFilterApplied: filter && filter.id !== 'none',
        });
      },

      setRoomBackground: (background) => {
        ///* console.log('🌌 Store: 배경 설정됨', background); */
        set({
          roomBackground: background,
          isBackgroundApplied: background && background.id !== 'none',
        });
      },

      // 🆕 모든 효과 초기화
      clearAllEffects: () => {
        /* console.log('🧹 Store: 모든 효과 초기화'); */
        set({
          selectedFilter: null,
          selectedFrame: null,
          roomBackground: null,
          filterIntensity: 100,
          backgroundOpacity: 100,
          frameOpacity: 100,
          isFilterApplied: false,
          isBackgroundApplied: false,
          isFrameApplied: false,
        });
      },

      // 🆕 현재 적용된 효과 정보 가져오기
      getCurrentEffects: () => {
        const state = get();
        return {
          filter: state.selectedFilter,
          background: state.roomBackground,
          frame: state.selectedFrame,
          intensities: {
            filter: state.filterIntensity,
            background: state.backgroundOpacity,
            frame: state.frameOpacity,
          },
          applied: {
            filter: state.isFilterApplied,
            background: state.isBackgroundApplied,
            frame: state.isFrameApplied,
          },
        };
      },

      // 🟢 기존 참여자 관리 (유지)
      addParticipant: (participant) =>
        set((state) => ({
          participants: [...state.participants, participant],
        })),
      removeParticipant: (participantId) =>
        set((state) => ({
          participants: state.participants.filter(
            (p) => p.id !== participantId
          ),
        })),

      // 🆕 Socket 연결 상태 관리
      setConnected: (connected) => set({ isConnected: connected }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      setSocketError: (error) => set({ socketError: error }),
      setClientId: (clientId) => set({ clientId }),

      // 🆕 실시간 상태 관리
      // canvasParticipantsStore 로 이관됨

      // updateParticipantPosition: (clientId, position) =>
      //   set((state) => ({
      //     participantPositions: {
      //       ...state.participantPositions,
      //       [clientId]: position,
      //     },
      //   })),

      // removeParticipantPosition: (clientId) =>
      //   set((state) => {
      //     const newPositions = { ...state.participantPositions };
      //     delete newPositions[clientId];
      //     return { participantPositions: newPositions };
      //   }),

      setRecording: (isRecording) => set({ isRecording }),
      setCountdown: (countdown) => set({ countdown }),
      // setRoomBackground: (background) => set({ roomBackground }),

      // 🆕 배경 관리
      setAvailableBackgrounds: (backgrounds) =>
        set({ availableBackgrounds: backgrounds }),
      setLoadingBackgrounds: (loading) =>
        set({ isLoadingBackgrounds: loading }),
      setBackgroundError: (error) => set({ backgroundError: error }),

      // 🆕 배경 목록 로드 (실제 API 호출)
      loadBackgrounds: async () => {
        set({ isLoadingBackgrounds: true, backgroundError: null });

        try {
          const result = await getAllBackgrounds();



          if (result.status === 'success') {
            set({
              availableBackgrounds: result.data.items,
              isLoadingBackgrounds: false,
            });
          } else {
            throw new Error('배경 목록을 불러오는데 실패했습니다.');
          }
        } catch (error) {
          /* console.error('배경 목록 로드 실패:', error); */
          const errorMessage = getErrorMessage(error);
          set({
            backgroundError: errorMessage,
            isLoadingBackgrounds: false,
          });
        }
      },

      // 🆕 방 배경 변경 (호스트만)
      changeRoomBackground: async (backgroundId) => {
        
        const { isHost, roomCode, clientId } = get();
        if (!isHost) {
          /* console.warn('호스트만 배경을 변경할 수 있습니다.'); */
          return;
        }

        // 선택된 배경 정보 찾기
        const { availableBackgrounds } = get();
        const selectedBackground = availableBackgrounds.find(
          (bg) => bg.backgroundId === backgroundId
        );

        if (!selectedBackground) {
          /* console.error('존재하지 않는 배경 ID:', backgroundId); */
          return;
        }

        // 로컬 상태 즉시 업데이트 (UX 향상)
        set({ roomBackground: selectedBackground });

        try {
          await changeBackground(roomCode, backgroundId,clientId);
          /* console.log('✅ 배경 변경 성공:', selectedBackground); */
        } catch (error) {
          /* console.error('❌ 배경 변경 실패:', error); */
          const errorMessage = getErrorMessage(error);
          set({ roomBackground: null });
          throw new Error(`배경 변경 실패: ${errorMessage}`);
        }
      },

      // 방 초기화 (방 나갈 때 사용)
      resetRoom: () => {
        // /* console.log('🏠 Store: 방 상태 초기화'); */
        set({
          roomCode: null,
          participants: [],
          isHost: false,
          isConnected: false,
          isConnecting: false,
          socketError: null,
          clientId: null,
          participantPositions: {},
          isRecording: false,
          countdown: null,

          // 효과들도 초기화
          selectedFrame: null,
          selectedFilter: null,
          roomBackground: null,
          // filterIntensity: 100,
          // backgroundOpacity: 100,
          // frameOpacity: 100,
          isFilterApplied: false,
          isBackgroundApplied: false,
          isFrameApplied: false,
        });
      },

      // 디버그용 함수 (개발환경에서만)
      debugStore: () => {
        if (import.meta.env.DEV) {
          const state = get();
          console.log('🐛 Store 상태:', {
            room: {
              code: state.roomCode,
              participants: state.participants.length,
              isHost: state.isHost,
            },
            effects: {
              filter: state.selectedFilter?.name || 'none',
              background: state.roomBackground?.name || 'none',
              frame: state.selectedFrame?.name || 'none',
              intensities: {
                filter: state.filterIntensity,
                background: state.backgroundOpacity,
                frame: state.frameOpacity,
              },
            },
            connection: {
              connected: state.isConnected,
              clientId: state.clientId,
            },
          });
        }
      },

      // 🆕 모킹 데이터 설정 (개발용 - 나중에 제거)
      // MOCK: 임시 개발용 함수들 (실제 API 준비되면 제거 예정)
      mockJoinRoom: (nickname) => {
        const mockClientId = `mock-${Date.now()}`;
        const mockUser = {
          id: mockClientId,
          clientId: mockClientId,
          nickname: nickname,
          joinedAt: new Date().toISOString(),
        };

        set((state) => ({
          clientId: mockClientId,
          isHost: state.participants.length === 0, // 첫 번째 참가자가 호스트
          participants: [...state.participants, mockUser],
          participantPositions: {
            ...state.participantPositions,
            [mockClientId]: { x: 100, y: 100, scale: 1.0, opacity: 1.0 },
          },
        }));

        return mockUser;
      },

      mockAddRemoteParticipant: (nickname) => {
        const mockClientId = `mock-remote-${Date.now()}`;
        const mockUser = {
          id: mockClientId,
          clientId: mockClientId,
          nickname: nickname,
          joinedAt: new Date().toISOString(),
        };

        set((state) => ({
          participants: [...state.participants, mockUser],
          participantPositions: {
            ...state.participantPositions,
            [mockClientId]: {
              x: Math.random() * 300 + 50,
              y: Math.random() * 200 + 50,
              scale: 1.0,
              opacity: 1.0,
            },
          },
        }));

        return mockUser;
      },
    }),
    {
      name: 'room-store',
      getStorage: () => sessionStorage, // 세션 스토리지 사용
      // persist에서 저장할 항목들 지정
      partialize: (state) => ({
        // 효과 관련은 세션마다 초기화
        filterIntensity: state.filterIntensity,
        backgroundOpacity: state.backgroundOpacity,
        frameOpacity: state.frameOpacity,
        clientId: state.clientId,
        roomCode: state.roomCode,
        isHost: state.isHost,
      }),
    }
  )
);
export default useRoomStore;
