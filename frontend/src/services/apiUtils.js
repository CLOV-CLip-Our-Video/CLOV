// utils/apiUtils.js
import axios from 'axios';
import { sendEvent } from '../services/socket';

// API 기본 설정
const API_CONFIG = {
  baseURL: 'https://clov.co.kr',
  // baseURL: 'https://dev.clov.co.kr',
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
};

const AI_CONFIG = {
  baseURL: 'https://thankfully-darling-gecko.ngrok-free.app',
  timeout: 120000, //2분
  headers: {
    'Content-Type': 'application/json',
  },
};

// Axios 인스턴스 생성
const apiClient = axios.create(API_CONFIG);

// AI 이미지 생성용 Axios 인스턴스 (타임아웃을 더 길게 설정)
const aiApiClient = axios.create(AI_CONFIG);

// ============================================================================
//  방 관리 API
// ============================================================================

/**
 * 방 생성
 * @param {string} nickname - 사용자 닉네임
 * @returns {Promise} API 응답
 */
export const createRoom = async (nickname) => {
  const response = await apiClient.post('/api/v1/rooms', { nickname });
  return response.data;
};

/**
 * 방 참가
 * @param {string} roomCode - 방 코드
 * @param {string} nickname - 사용자 닉네임
 * @returns {Promise} API 응답
 */
export const joinRoom = async (roomCode, nickname) => {
  const response = await apiClient.post(`/api/v1/rooms/${roomCode}/members`, {
    nickname,
  });
  return response.data;
};

/**
 * 방 나가기
 * @param {string} roomCode - 방 코드
 * @param {string} clientId - 클라이언트 ID
 * @returns {Promise} API 응답
 */
export const leaveRoom = async (roomCode, clientId) => {
  const response = await apiClient.delete(
    `/api/v1/rooms/${roomCode}/members/${clientId}`
  );
  return response.data;
};

/**
 * 방 유효성 검사
 * @param {string} roomCode - 방 코드
 * @returns {Promise} API 응답
 */
export const checkRoomValidity = async (roomCode) => {
  const response = await apiClient.get(`/api/v1/rooms/${roomCode}`);
  return response.data;
};

/**
 * 참가자 목록 조회
 * @param {string} roomCode - 방 코드
 * @returns {Promise} API 응답
 */
export const fetchParticipants = async (roomCode) => {
  const response = await apiClient.get(`/api/v1/rooms/${roomCode}/members`);
  return response.data;
};

// 방장 위임 요청
export const assignHost = async (roomCode, previousHostId, newHostId) => {
  const response = await apiClient.patch(`/api/v1/rooms/${roomCode}`, {
    previousHostId,
    newHostId,
  });
  // console.log('#####################');
  // console.log('Host assigned:', response.data);
  // console.log('#####################');
  return response.data;
};

// ============================================================================
//  배경 관리 API
// ============================================================================

/**
 * 모든 배경 목록 조회
 * @returns {Promise} API 응답
 */
export const getAllBackgrounds = async () => {
  const response = await apiClient.get('/api/v1/backgrounds');
  return response.data;
};

/**
 * 방 배경 변경
 * @param {string} roomCode - 방 코드
 * @param {number} backgroundId - 배경 ID (-1은 커스텀 배경)
 * @param {string} clientId - 클라이언트 ID
 * @returns {Promise} API 응답
 */
export const changeBackground = async (roomCode, backgroundId, clientId) => {
  try {
    // ✅ WebSocket 이벤트 발송으로 대체
    if (clientId) {
      sendEvent('change-background', {
        roomCode,
        clientId,
        backgroundId,
      });
      // console.log('전송할 데이터:', {
      //   roomCode,
      //   clientId,
      //   backgroundId: { backgroundId: backgroundId },
      // });

      // WebSocket 이벤트가 성공적으로 처리되었다고 가정하고 성공 응답 반환
      return { status: 200, message: '배경 변경 요청이 전송되었습니다' };
    } else {
      throw new Error('클라이언트 ID가 필요합니다');
    }
  } catch (error) {
    console.error('배경 변경 실패:', error);
    throw error;
  }
  // 기존 restapi 방식은 deprecated
  // const response = await apiClient.put(
  //   `/api/v1/rooms/${roomCode}/canvas/background`,
  //   {
  //     backgroundId,
  //   }
  // );
  // return response.data;
};

/**
 * 배경 업로드용 Presigned URL 요청
 * @param {string} roomCode - 방 코드
 * @returns {Promise} Presigned URL
 */
export const getPresignedBackgroundUploadUrl = async (roomCode) => {
  const response = await apiClient.post(
    `/api/v1/rooms/${roomCode}/canvas/background`,
    {
      roomCode,
    }
  );

  if (
    (response.data.status === 200 || response.data.status === 201) &&
    response.data.data?.presignedUrl
  ) {
    return response.data.data.presignedUrl;
  } else {
    throw new Error(response.data.message || 'Presigned URL 요청 실패');
  }
};

// ============================================================================
// 🤖 AI 배경 생성 API
// ============================================================================

/**
 * AI 배경 이미지 생성
 * @param {string} prompt - 이미지 생성 프롬프트
 * @param {number} width - 이미지 너비 (기본: 512)
 * @param {number} height - 이미지 높이 (기본: 512)
 * @returns {Promise<Blob>} 생성된 이미지 Blob
 */
export const generateAIBackground = async (
  prompt,
  width = 512,
  height = 512
) => {
  try {
    const response = await aiApiClient.post(
      '/generate',
      {
        prompt,
        width,
        height,
      },
      {
        responseType: 'blob', // 이미지 데이터를 blob으로 받음
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (response.status === 200 && response.data) {
      return response.data; // Blob 반환
    } else {
      throw new Error('AI 이미지 생성에 실패했습니다');
    }
  } catch (error) {
    // 에러 처리
    if (error.response?.status === 503) {
      throw new Error(
        'AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      );
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다. 프롬프트를 확인해주세요.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('이미지 생성 시간이 초과되었습니다. 다시 시도해주세요.');
    } else {
      throw new Error(getErrorMessage(error));
    }
  }
};

/**
 * AI 서버 상태 확인
 * @returns {Promise} API 응답
 */
export const checkAIServerHealth = async () => {
  const response = await apiClient.get('/api/v1/backgrounds/ai/health');
  return response.data;
};

/**
 * AI 생성 이미지를 배경으로 업로드
 * @param {string} roomCode - 방 코드
 * @param {Blob} imageBlob - 생성된 이미지 Blob
 * @returns {Promise} 업로드 결과
 */
export const uploadAIBackgroundToRoom = async (
  roomCode,
  imageBlob,
  clientId
) => {
  try {
    // 1. Presigned URL 요청
    const presignedUrl = await getPresignedBackgroundUploadUrl(roomCode);

    // 2. S3에 이미지 업로드
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: imageBlob,
      headers: {
        'Content-Type': 'image/png',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`업로드 실패: ${uploadResponse.status}`);
    }

    // 3. 배경 변경 요청 (커스텀 배경으로 설정)
    await changeBackground(roomCode, -1, clientId);

    return { success: true, message: 'AI 배경이 성공적으로 적용되었습니다' };
  } catch (error) {
    throw new Error(`배경 업로드 실패: ${getErrorMessage(error)}`);
  }
};

// ============================================================================
// 📹 영상/미디어 관리 API
// ============================================================================

/**
 * 영상 업로드용 Presigned URL 요청
 * @param {string} roomCode - 방 코드
 * @param {string} fileType - 파일 타입 (기본: 'video/mp4')
 * @returns {Promise} API 응답
 */
export const getPresignedVideoUploadUrl = async (
  roomCode,
  fileType = 'video/mp4'
) => {
  const response = await apiClient.post('/api/v1/records', {
    roomCode,
    fileType,
  });
  return response.data;
};

/**
 * 영상 업로드 완료 알림
 * @param {Object} uploadData - 업로드 데이터
 * @param {string} uploadData.mediaFileId - 미디어 파일 ID
 * @param {string} uploadData.roomCode - 방 코드
 * @param {string} uploadData.fileUrl - 파일 URL
 * @param {string} uploadData.createdAt - 생성 시간
 * @param {string} uploadData.contentType - 콘텐츠 타입 (기본: 'video/mp4')
 * @returns {Promise} API 응답
 */
export const notifyVideoUploadComplete = async ({
  mediaFileId,
  roomCode,
  fileUrl,
  createdAt,
  contentType = 'video/mp4',
}) => {
  const response = await apiClient.post('/api/v1/records/upload', {
    mediaFileId,
    roomCode,
    fileUrl,
    createdAt,
    contentType,
  });
  return response.data;
};

// ============================================================================
// 📹 프로메테우스 메트릭 푸시 API
// ============================================================================
// WebRTC 메트릭 수집 & Pushgateway 전송

// 이전 통계 저장용 (bitrate, fps 계산)
const prevStatsMap = {};

// 모든 피어 연결에서 통계 수집
const collectAllStats = async (peerConnectionsRef) => {
  const allStats = {};
  const connections = Object.entries(peerConnectionsRef.current);

  if (connections.length === 0) return null;

  for (const [participantId, pc] of connections) {
    if (pc.connectionState === 'connected') {
      try {
        const stats = await pc.getStats();
        let bytesSent = 0;
        let packetsLost = 0;
        let packetsSent = 0;
        let timestamp = 0;
        let rtt = 0;
        let jitter = 0;
        let fps = 0;
        let width = 0;
        let height = 0;
        let codec = '';
        let qualityLimitation = { bandwidth: 0, cpu: 0, other: 0 };

        stats.forEach((report) => {
          // Video outbound-rtp
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            bytesSent += report.bytesSent || 0;
            packetsLost += report.packetsLost || 0;
            packetsSent += report.packetsSent || 0;
            timestamp = report.timestamp || timestamp;
            fps = report.framesPerSecond || fps;
          }

          // remote-inbound-rtp (RTT, Jitter)
          if (
            report.type === 'remote-inbound-rtp' &&
            report.mediaType === 'video'
          ) {
            rtt = report.roundTripTime ? report.roundTripTime * 1000 : rtt; // ms로 변환
            jitter = report.jitter ? report.jitter * 1000 : jitter; // ms
          }

          // track report (해상도)
          if (report.type === 'track' && report.kind === 'video') {
            width = report.frameWidth || width;
            height = report.frameHeight || height;
          }

          // codec 정보
          if (report.type === 'codec' && report.mimeType) {
            if (report.mimeType.startsWith('video')) {
              codec = report.mimeType;
            }
          }

          // 송출제한(품질 제한) 시간
          if (
            report.type === 'outbound-rtp' &&
            report.qualityLimitationDurations
          ) {
            const total = Object.values(
              report.qualityLimitationDurations
            ).reduce((a, b) => a + b, 0);
            if (total > 0) {
              qualityLimitation.bandwidth =
                (report.qualityLimitationDurations.bandwidth / total) * 100 ||
                0;
              qualityLimitation.cpu =
                (report.qualityLimitationDurations.cpu / total) * 100 || 0;
              qualityLimitation.other =
                (report.qualityLimitationDurations.other / total) * 100 || 0;
            }
          }
        });

        // bitrate 계산
        let bitrate = 0;
        const prev = prevStatsMap[participantId];
        if (prev && timestamp > prev.timestamp) {
          const timeDiff = (timestamp - prev.timestamp) / 1000; // ms → s
          const bytesDiff = bytesSent - prev.bytesSent;
          if (timeDiff > 0 && bytesDiff > 0) {
            bitrate = (bytesDiff * 8) / timeDiff; // bps
          }
        }
        prevStatsMap[participantId] = { bytesSent, timestamp };

        const packetLoss = packetsSent > 0 ? packetsLost / packetsSent : 0;

        allStats[participantId] = {
          packetLoss,
          bitrate: Math.round(bitrate / 1000), // kbps
          rtt,
          jitter,
          fps,
          width,
          height,
          codec,
          qualityLimitation,
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
        };
      } catch (err) {
        console.error(`Stats collection failed for ${participantId}:`, err);
      }
    }
  }

  return allStats;
};

// Prometheus 메트릭 push
const pushMetrics = async (metricsText, clientId) => {
  try {
    const url = `https://dev.clov.co.kr/metrics/job/webrtcperf/instance/${clientId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: metricsText.endsWith('\n') ? metricsText : metricsText + '\n',
    });
    if (!response.ok) {
      console.error(
        'Failed to push metrics:',
        response.status,
        response.statusText
      );
    }
  } catch (err) {
    console.error('Metrics push error:', err);
  }
};

// 통계 수집 & 푸시 (연결 없을 때도 0푸시)
export const pushWebRTCMetrics = async (peerConnectionsRef, clientId) => {
  const allStats = await collectAllStats(peerConnectionsRef);

  if (!allStats || Object.keys(allStats).length === 0) {
    console.warn('No active stats to push - sending zero metrics');
    const zeroMetrics = `webrtc_packet_loss_percent 0
webrtc_bitrate_kbps 0
webrtc_active_connections 0
webrtc_rtt_ms 0
webrtc_jitter_ms 0
webrtc_video_fps 0
webrtc_video_width 0
webrtc_video_height 0
webrtc_quality_limitation_bandwidth_percent 0
webrtc_quality_limitation_cpu_percent 0
webrtc_quality_limitation_other_percent 0
webrtc_client_id{client_id="${clientId}"} 1


`;

    await pushMetrics(zeroMetrics, clientId);
    return;
  }

  // 평균값 계산
  const connections = Object.values(allStats);
  const avg = (key) =>
    connections.reduce((sum, s) => sum + (s[key] || 0), 0) / connections.length;

  const avgPacketLoss = avg('packetLoss');
  const totalBitrate = connections.reduce((sum, s) => sum + s.bitrate, 0);
  const avgRtt = avg('rtt');
  const avgJitter = avg('jitter');
  const avgFps = avg('fps');
  const avgWidth = avg('width');
  const avgHeight = avg('height');
  const avgQLBandwidth =
    connections.reduce(
      (sum, s) => sum + (s.qualityLimitation.bandwidth || 0),
      0
    ) / connections.length;
  const avgQLCpu =
    connections.reduce((sum, s) => sum + (s.qualityLimitation.cpu || 0), 0) /
    connections.length;
  const avgQLOther =
    connections.reduce((sum, s) => sum + (s.qualityLimitation.other || 0), 0) /
    connections.length;

  // ✅ 개선된 코드 (주석 없이 GAUGE 형식)
  const metrics = `webrtc_packet_loss_percent ${avgPacketLoss.toFixed(4)}
webrtc_bitrate_kbps ${totalBitrate}
webrtc_active_connections ${connections.length}
webrtc_rtt_ms ${avgRtt.toFixed(2)}
webrtc_jitter_ms ${avgJitter.toFixed(2)}
webrtc_video_fps ${avgFps.toFixed(2)}
webrtc_video_width ${avgWidth.toFixed(0)}
webrtc_video_height ${avgHeight.toFixed(0)}
webrtc_quality_limitation_bandwidth_percent ${avgQLBandwidth.toFixed(2)}
webrtc_quality_limitation_cpu_percent ${avgQLCpu.toFixed(2)}
webrtc_quality_limitation_other_percent ${avgQLOther.toFixed(2)}
webrtc_client_id{client_id="${clientId}"} 1


`;

  await pushMetrics(metrics, clientId);
};

// 5초마다 수집 시작
export const startMetricsCollection = (peerConnectionsRef, clientId) => {
  return setInterval(() => {
    pushWebRTCMetrics(peerConnectionsRef, clientId);
  }, 5000);
};

// interval 종료
export const stopMetricsCollection = (metricsInterval) => {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }
};

// ============================================================================
// 🛠️ 유틸리티 함수들
// ============================================================================

/**
 * 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @param {Object} options - 검사 옵션
 * @param {Array} options.allowedTypes - 허용된 MIME 타입들
 * @param {number} options.maxSize - 최대 파일 크기 (바이트)
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    maxSize = 10 * 1024 * 1024, // 10MB
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `지원하는 파일 형식: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * API 응답 상태 체크
 * @param {Object} response - API 응답 객체
 * @param {Array} validStatuses - 유효한 상태 코드들 (기본: [200, 201])
 * @returns {boolean} 성공 여부
 */
export const isApiSuccess = (response, validStatuses = [200, 201]) => {
  return validStatuses.includes(response.status);
};

/**
 * 파일명 생성 함수
 * @param {Object} options - 옵션
 * @param {string} options.prefix - 파일명 접두사 (기본: 'clov')
 * @param {string} options.roomCode - 방 코드
 * @param {string} options.extension - 파일 확장자 (기본: 'webm')
 * @returns {string} 생성된 파일명
 */
export const generateFileName = (options = {}) => {
  const { prefix = 'clov', roomCode = 'room', extension = 'webm' } = options;

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
  const randomId = Math.random().toString(36).substr(2, 6);

  return `${prefix}_${roomCode}_${timestamp}_${randomId}.${extension}`;
};

/**
 * 파일 다운로드 함수
 * @param {string|Blob} source - 다운로드할 소스 (URL 또는 Blob)
 * @param {string} fileName - 파일명
 * @returns {Promise} 다운로드 완료 Promise
 */
export const downloadFile = async (source, fileName) => {
  let downloadUrl;
  let shouldRevokeUrl = false;

  if (source instanceof Blob) {
    downloadUrl = URL.createObjectURL(source);
    shouldRevokeUrl = true;
  } else if (typeof source === 'string') {
    if (source.startsWith('http')) {
      // 외부 URL인 경우 Blob으로 변환
      const response = await fetch(source);
      const blob = await response.blob();
      downloadUrl = URL.createObjectURL(blob);
      shouldRevokeUrl = true;
    } else {
      // Blob URL인 경우 그대로 사용
      downloadUrl = source;
    }
  } else {
    throw new Error('지원하지 않는 소스 타입입니다.');
  }

  // 다운로드 실행
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // URL 정리
  if (shouldRevokeUrl) {
    URL.revokeObjectURL(downloadUrl);
  }
};

/**
 * 진행률 시뮬레이션 함수
 * @param {Function} onProgress - 진행률 콜백 (0-100)
 * @param {number} duration - 시뮬레이션 지속 시간 (ms, 기본: 2000)
 * @returns {Promise} 완료 Promise
 */
export const simulateProgress = (onProgress, duration = 2000) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        onProgress(100);
        clearInterval(interval);
        resolve();
      } else {
        onProgress(progress);
      }
    }, duration / 20); // 20단계로 나누어 진행
  });
};

/**
 * 에러 처리 헬퍼
 * @param {Error} error - 처리할 에러
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

// 기본 내보내기 (필요시 사용)
export default {
  // 방 관리
  createRoom,
  joinRoom,
  leaveRoom,
  checkRoomValidity,
  fetchParticipants,

  // 배경 관리
  getAllBackgrounds,
  changeBackground,
  getPresignedBackgroundUploadUrl,

  // AI 배경 생성
  generateAIBackground,
  checkAIServerHealth,
  uploadAIBackgroundToRoom,

  // 영상 관리
  getPresignedVideoUploadUrl,
  notifyVideoUploadComplete,

  //프로메테우스 메트릭 푸시 API
  pushWebRTCMetrics,
  startMetricsCollection,
  stopMetricsCollection,

  // 유틸리티
  validateFile,
  isApiSuccess,
  generateFileName,
  downloadFile,
  simulateProgress,
  getErrorMessage,
};
