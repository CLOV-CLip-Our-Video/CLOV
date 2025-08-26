/* eslint-disable */
/**
 * CLOV 프로젝트 전역 상수 정의
 * 팀원들이 공통으로 사용할 상수들을 정의합니다.
 */

// ===== 방 설정 관련 =====
export const ROOM_CONFIG = {
    MAX_PARTICIPANTS: 8,          // 최대 참여자 수
    MIN_PARTICIPANTS: 1,          // 최소 참여자 수
    ROOM_CODE_LENGTH: 6,          // 방 코드 길이
    ROOM_TIMEOUT: 30 * 60 * 1000, // 방 타임아웃 (30분)
    NICKNAME_MAX_LENGTH: 12,      // 닉네임 최대 길이
    NICKNAME_MIN_LENGTH: 2,       // 닉네임 최소 길이
  };
  
  // ===== WebRTC 설정 =====
  export const WEBRTC_CONFIG = {
    ICE_SERVERS: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    VIDEO_CONSTRAINTS: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }
    },
    AUDIO_CONSTRAINTS: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };
  
  // ===== 녹화 설정 =====
  export const RECORDING_CONFIG = {
    MAX_RECORDING_TIME: 10 * 60 * 1000, // 최대 녹화 시간 (10분)
    COUNTDOWN_DURATION: 3,               // 카운트다운 시간 (초)
    VIDEO_QUALITY: {
      HIGH: { width: 1920, height: 1080, bitrate: 5000000 },
      MEDIUM: { width: 1280, height: 720, bitrate: 2500000 },
      LOW: { width: 854, height: 480, bitrate: 1000000 }
    },
    SUPPORTED_FORMATS: ['webm', 'mp4'],
    PHOTO_FORMAT: 'png',
    PHOTO_QUALITY: 0.95
  };
  
  // ===== UI 설정 =====
  export const UI_CONFIG = {
    CAMERA_SIZE_RANGE: { min: 50, max: 200, default: 100 },
    TRANSPARENCY_RANGE: { min: 10, max: 100, default: 80 },
    ROTATION_RANGE: { min: 0, max: 359, default: 0 },
    ANIMATION_DURATION: 300,              // 기본 애니메이션 시간 (ms)
    TOAST_DURATION: 3000,                 // 토스트 표시 시간 (ms)
    DEBOUNCE_DELAY: 300,                  // 디바운스 지연 시간 (ms)
    THROTTLE_DELAY: 100,                  // 스로틀 지연 시간 (ms)
  };

  // ===== 회전 설정 =====
  export const ROTATION_SETTINGS = {
    // 드래그 회전 시 각도 스냅 단위 (도)
    SNAP_DEGREES: 5,
    // R키 회전 각도 (도) 
    MANUAL_ROTATION_DEGREES: 45,
  };
  
  // ===== 카메라 모드 =====
  export const CAMERA_MODES = {
    FULL: 1,          // 배경 포함 전체
    PERSON_ONLY: 2,   // 배경 제거 (사람만)
    FACE_ONLY: 3      // 얼굴만
  };
  
  export const CAMERA_MODE_LABELS = {
    [CAMERA_MODES.FULL]: '배경 표시',
    [CAMERA_MODES.PERSON_ONLY]: '배경 제거',
    [CAMERA_MODES.FACE_ONLY]: '얼굴만'
  };
  
  // ===== 연결 상태 =====
  export const CONNECTION_STATUS = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    FAILED: 'failed'
  };
  
  // ===== 방 상태 =====
  export const ROOM_STATUS = {
    WAITING: 'waiting',     // 대기 중
    ACTIVE: 'active',       // 활성 (촬영 가능)
    RECORDING: 'recording', // 녹화 중
    CLOSED: 'closed'        // 종료됨
  };
  
  // ===== 사용자 역할 =====
  export const USER_ROLES = {
    HOST: 'host',           // 방장
    PARTICIPANT: 'participant' // 참여자
  };
  
  // ===== 메시지 타입 (Socket.io) =====
  export const MESSAGE_TYPES = {
    // 방 관련
    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',
    ROOM_FULL: 'room-full',
    
    // 사용자 관련
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    USER_READY: 'user-ready',
    
    // 촬영 관련
    START_COUNTDOWN: 'start-countdown',
    START_RECORDING: 'start-recording',
    STOP_RECORDING: 'stop-recording',
    TAKE_PHOTO: 'take-photo',
    
    // 카메라 제어
    CAMERA_TOGGLE: 'camera-toggle',
    MIC_TOGGLE: 'mic-toggle',
    POSITION_UPDATE: 'position-update',
    
    // 설정 변경
    BACKGROUND_CHANGE: 'background-change',
    FILTER_CHANGE: 'filter-change',
    FRAME_CHANGE: 'frame-change',
    
    // 채팅
    CHAT_MESSAGE: 'chat-message',
    
    // 에러
    ERROR: 'error'
  };
  
  // ===== 에러 코드 =====
  export const ERROR_CODES = {
    // 방 관련 에러
    ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
    ROOM_FULL: 'ROOM_FULL',
    ROOM_CLOSED: 'ROOM_CLOSED',
    
    // 권한 관련 에러
    NOT_HOST: 'NOT_HOST',
    CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
    MIC_PERMISSION_DENIED: 'MIC_PERMISSION_DENIED',
    
    // WebRTC 에러
    WEBRTC_CONNECTION_FAILED: 'WEBRTC_CONNECTION_FAILED',
    WEBRTC_DISCONNECTED: 'WEBRTC_DISCONNECTED',
    
    // 녹화 에러
    RECORDING_FAILED: 'RECORDING_FAILED',
    RECORDING_TOO_LONG: 'RECORDING_TOO_LONG',
    
    // 네트워크 에러
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    
    // 파일 관련 에러
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
    UPLOAD_FAILED: 'UPLOAD_FAILED'
  };
  
  // ===== 에러 메시지 =====
  export const ERROR_MESSAGES = {
    [ERROR_CODES.ROOM_NOT_FOUND]: '방을 찾을 수 없습니다.',
    [ERROR_CODES.ROOM_FULL]: '방이 가득 찼습니다.',
    [ERROR_CODES.ROOM_CLOSED]: '방이 종료되었습니다.',
    [ERROR_CODES.NOT_HOST]: '방장만 사용할 수 있는 기능입니다.',
    [ERROR_CODES.CAMERA_PERMISSION_DENIED]: '카메라 권한이 필요합니다.',
    [ERROR_CODES.MIC_PERMISSION_DENIED]: '마이크 권한이 필요합니다.',
    [ERROR_CODES.WEBRTC_CONNECTION_FAILED]: '연결에 실패했습니다.',
    [ERROR_CODES.WEBRTC_DISCONNECTED]: '연결이 끊어졌습니다.',
    [ERROR_CODES.RECORDING_FAILED]: '녹화 중 오류가 발생했습니다.',
    [ERROR_CODES.RECORDING_TOO_LONG]: '녹화 시간이 너무 깁니다.',
    [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
    [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다.',
    [ERROR_CODES.FILE_TOO_LARGE]: '파일 크기가 너무 큽니다.',
    [ERROR_CODES.INVALID_FILE_FORMAT]: '지원하지 않는 파일 형식입니다.',
    [ERROR_CODES.UPLOAD_FAILED]: '업로드에 실패했습니다.'
  };
  
  // ===== 파일 관련 =====
  export const FILE_CONFIG = {
    MAX_SIZE: 50 * 1024 * 1024,    // 최대 파일 크기 (50MB)
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
    BACKGROUND_MAX_SIZE: 10 * 1024 * 1024, // 배경 이미지 최대 크기 (10MB)
  };
  
  // ===== API 엔드포인트 =====
  export const API_ENDPOINTS = {
    // BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    
    // 방 관련
    ROOMS: '/api/v1/rooms',
    CREATE_ROOM: '/api/v1/rooms',
    JOIN_ROOM: (roomCode) => `/api/v1/rooms/${roomCode}/join`,
    LEAVE_ROOM: (roomCode) => `/api/v1/rooms/${roomCode}/leave`,
    ROOM_STATUS: (roomCode) => `/api/v1/rooms/${roomCode}/status`,
    
    // 파일 관련
    UPLOAD_FILE: '/api/v1/files/upload',
    DOWNLOAD_FILE: (fileId) => `/api/v1/files/${fileId}`,
    DELETE_FILE: (fileId) => `/api/v1/files/${fileId}`,
    
    // 배경 관련
    BACKGROUNDS: '/api/v1/backgrounds',
    UPLOAD_BACKGROUND: '/api/v1/backgrounds/upload',
    
    // 히스토리
    ROOM_HISTORY: (roomCode) => `/api/v1/rooms/${roomCode}/history`,
    USER_HISTORY: '/api/v1/user/history'
  };
  
  // ===== Socket.io 설정 =====
  export const SOCKET_CONFIG = {
    // URL: process.env.REACT_APP_SOCKET_URL || 'ws://localhost:8080',
    OPTIONS: {
      transports: ['websocket'],
      forceNew: true,
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    }
  };
  
  // ===== 로컬 스토리지 키 =====
  export const STORAGE_KEYS = {
    USER_PREFERENCES: 'clov_user_preferences',
    RECENT_ROOMS: 'clov_recent_rooms',
    CAMERA_SETTINGS: 'clov_camera_settings',
    LAST_NICKNAME: 'clov_last_nickname',
    THEME: 'clov_theme'
  };
  
  // ===== 성능 모니터링 =====
  export const PERFORMANCE_CONFIG = {
    FPS_CHECK_INTERVAL: 1000,      // FPS 체크 간격 (ms)
    BANDWIDTH_CHECK_INTERVAL: 5000, // 대역폭 체크 간격 (ms)
    LATENCY_CHECK_INTERVAL: 3000,   // 지연시간 체크 간격 (ms)
    WARNING_THRESHOLDS: {
      LOW_FPS: 15,                  // 낮은 FPS 경고 임계값
      HIGH_LATENCY: 200,            // 높은 지연시간 경고 임계값 (ms)
      LOW_BANDWIDTH: 1000000        // 낮은 대역폭 경고 임계값 (bps)
    }
  };
  
  // ===== 브라우저 호환성 체크 =====
  export const BROWSER_SUPPORT = {
    REQUIRED_FEATURES: [
      'mediaDevices',
      'RTCPeerConnection',
      'MediaRecorder',
      'Canvas',
      'WebSocket'
    ],
    OPTIONAL_FEATURES: [
      'MediaSource',
      'OffscreenCanvas',
      'ImageCapture'
    ]
  };
  
  // ===== 개발/디버그 모드 =====
  export const DEBUG_CONFIG = {
    ENABLED: process.env.NODE_ENV === 'development',
    LOG_LEVELS: {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    },
    CURRENT_LOG_LEVEL: process.env.NODE_ENV === 'development' ? 3 : 1
  };
  
  // 환경별 설정 오버라이드
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션 환경에서의 설정 조정
    RECORDING_CONFIG.MAX_RECORDING_TIME = 5 * 60 * 1000; // 5분으로 제한
    UI_CONFIG.TOAST_DURATION = 2000; // 토스트 시간 단축
    WEBRTC_CONFIG.VIDEO_CONSTRAINTS.frameRate.max = 30; // FPS 제한
  }

  export const OVERLAY_ITEMS = [
    { id: 'none', name: '없음', preview: '🚫', type: 'none' },

    {
      id: 'pooding_all',
      name: '푸딩 친구들',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_all.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_all.png',
      description: '귀여운 푸딩 총 출동.',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'bottom',     // 'top', 'center', 'bottom' 
        sizeMultiplier: 7,  // 크기 배수
        aspectRatio: 1,
        yOffset: 0,            // Y축 미세 조정
        xOffset: 0
      }
    },

        {
      id: 'pooding_caramel',
      name: '카라멜 푸딩',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_caramel.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_caramel.png',
      description: '정~말 달콤해!',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'bottom',     // 'top', 'center', 'bottom' 
        sizeMultiplier:3,  // 크기 배수
        aspectRatio: 1,
        yOffset: -50,            // Y축 미세 조정
        xOffset: 0
      }
    },
    
    {
      id: 'pooding_melon',
      name: '멜론 푸딩',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_melon.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_melon.png',
      description: '어지러워~~',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'top',     // 'top', 'center', 'bottom' 
        sizeMultiplier:3,  // 크기 배수
        aspectRatio: 1,
        yOffset: -50,                 // Y축 미세 조정
        xOffset: 0
      }
    },
    
            {
      id: 'pooding_strawberry',
      name: '딸기 푸딩',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_strawberry.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/pooding_strawberry.png',
      description: '카라멜 푸딩이 날 좋아하는 것 같아!',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'top',     // 'top', 'center', 'bottom' 
        sizeMultiplier:3,  // 크기 배수
        aspectRatio: 1,
        yOffset: -50,               // Y축 미세 조정
        xOffset: 0
      }
    },
    




    {
      id: 'sunglasses_circle',
      name: '동글이 선글라스',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_circle.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_circle.png',
      description: '영역전개는 못씁니다.',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'center',     // 'top', 'center', 'bottom' 
        sizeMultiplier: 2,  // 크기 배수
        aspectRatio: 2.3,
        yOffset: 0,            // Y축 미세 조정
        xOffset: 0
      }
    },
    {
      id: 'sunglasses_alien',
      name: '외계인 선글라스',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_alien.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_alien.png',
      description: '저 그런 외계인 아닙니다.',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'center',     // 'top', 'center', 'bottom' 
        sizeMultiplier: 2.4,  // 크기 배수
        aspectRatio: 2,
        yOffset: 0,            // Y축 미세 조정
        xOffset: 0
      }
    },
    {
      id: 'sunglasses_pixel',
      name: '픽셀 선글라스',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_pixel.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_pixel.png',
      description: '돈이 많아보이는 효과가 있습니다.',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'center',     // 'top', 'center', 'bottom' 
        sizeMultiplier: 2.8,  // 크기 배수
        aspectRatio: 1.7,
        yOffset: 0,            // Y축 미세 조정
        xOffset: 0
      }
    },

    {
    id: 'sunglasses_bignose',
    name: '코주부 안경',
    preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_bignose.png',
    type: 'overlay',
    overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_bignose.png',
    description: '코가 굉장히 커보입니다.',
    renderSettings: {
      xPosition: 'center',  // 'center', 'left', 'right'
      yPosition: 'top',     // 'top', 'center', 'bottom' 
      sizeMultiplier: 3.0,  // 크기 배수
      aspectRatio: 1,
      yOffset: 13,            // Y축 미세 조정
      xOffset: 0
      }
    },
      {
    id: 'sunglasses_sleep',
    name: '수면 안대',
    preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_sleep.png',
    type: 'overlay',
    overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_sleep.png',
    description: 'Zzz...',
    renderSettings: {
      xPosition: 'center',  // 'center', 'left', 'right'
      yPosition: 'top',     // 'top', 'center', 'bottom' 
      sizeMultiplier: 2.6,  // 크기 배수
      aspectRatio: 1.0,  //가로/세로 비율
      yOffset: 0,            // Y축 미세 조정
      xOffset: 0
      }
    },

    {
    id: 'sunglasses_tears',
    name: '눈물펑펑',
    preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_tears.png',
    type: 'overlay',
    overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/sunglasses_tears.png',
    description: '눈에서 땀이 많이 나네..',
    renderSettings: {
      xPosition: 'center',  // 'center', 'left', 'right'
      yPosition: 'bottom',     // 'top', 'center', 'bottom' 
      sizeMultiplier: 2.3,  // 크기 배수
      aspectRatio: 1.0,  //가로/세로 비율
      yOffset: 16,            // Y축 미세 조정
      xOffset: 0
      }
    },

    {
    id: 'sunglasses_sadgirl',
    name: '순정 만화',
    preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/mask_sadgirl.png',
    type: 'overlay',
    overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/mask_sadgirl.png',
    description: '바보..',
    renderSettings: {
      xPosition: 'center',  // 'center', 'left', 'right'
      yPosition: 'center',     // 'top', 'center', 'bottom' 
      sizeMultiplier: 2.4,  // 크기 배수
      aspectRatio: 0.88,  //가로/세로 비율
      yOffset: 25,            // Y축 미세 조정
      xOffset: 0
      }
    },
    {
    id: 'sunglasses_pierrot',
    name: '삐에로',
    preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/mask_pierrot.png',
    type: 'overlay',
    overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/mask_pierrot.png',
    description: '응~~~ 계속 사진찍으면 그만이야~~~',
    renderSettings: {
      xPosition: 'center',  // 'center', 'left', 'right'
      yPosition: 'top',     // 'top', 'center', 'bottom' 
      sizeMultiplier: 6,  // 크기 배수
      aspectRatio: 1.2,  //가로/세로 비율
      yOffset: 24,            // Y축 미세 조정
      xOffset: -5
      }
    },


    {
      id: 'effect_coldman',
      name: '눈보라',
      preview: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/effect_coldman.png',
      type: 'overlay',
      overlayImage: 'https://clov-media-bucket.s3.ap-northeast-2.amazonaws.com/overlay/effect_coldman.png',
      description: '기.. 기자님?',
      renderSettings: {
        xPosition: 'center',  // 'center', 'left', 'right'
        yPosition: 'bottom',     // 'top', 'center', 'bottom' 
        sizeMultiplier:7,  // 크기 배수
        aspectRatio: 1,
        yOffset: 30,               // Y축 미세 조정
        xOffset: 10,
      }
    },




    
  ];

  export const getOverlayById = (overlayId) => {
    return OVERLAY_ITEMS.find(item => item.id === overlayId);
  };