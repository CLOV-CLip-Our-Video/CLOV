// src/services/turnService.js

// 설정 상수들
const TURN_CONFIG = {
  baseUrl: 'https://dev.clov.co.kr', //배포시에도 dev로해두어야합니당.
  endpoint: '/api/v1/turn/credentials',
  timeout: 10000, // 10초 타임아웃
};

export const getTurnCredentials = async (clientId, config = {}) => {
  try {
    /* console.log('🔑 TURN 자격증명 요청 중...', clientId); */

    // 설정 병합 (전달된 config로 기본값 오버라이드)
    const finalConfig = { ...TURN_CONFIG, ...config };
    const url = `${finalConfig.baseUrl}${finalConfig.endpoint}?clientId=${clientId}`;

    /* console.log('🌐 요청 URL:', url); */

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(finalConfig.timeout), // 타임아웃 설정
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    /* console.log('🔑 TURN 응답 데이터:', data); */

    if (data.status === 200 && data.data) {
      // console.log('✅ TURN 자격증명 성공:', {
        // username: data.data.username,
        // credential: '***', // 보안상 credential은 숨김
      // });

      return {
        username: data.data.username,
        credential: data.data.credential,
      };
    } else {
      throw new Error(`TURN 자격증명 실패: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    if (error.name === 'TimeoutError') {
      /* console.error('❌ TURN 자격증명 요청 타임아웃:', error); */
    } else {
      /* console.error('❌ TURN 자격증명 요청 실패:', error); */
    }
    return null;
  }
};

// 설정을 변경할 수 있는 헬퍼 함수들
export const setTurnServerUrl = (baseUrl) => {
  TURN_CONFIG.baseUrl = baseUrl;
  /* console.log('🔧 TURN 서버 URL 변경됨:', baseUrl); */
};

export const setTurnEndpoint = (endpoint) => {
  TURN_CONFIG.endpoint = endpoint;
  /* console.log('🔧 TURN 엔드포인트 변경됨:', endpoint); */
};

export const setTurnTimeout = (timeout) => {
  TURN_CONFIG.timeout = timeout;
  /* console.log('🔧 TURN 타임아웃 변경됨:', timeout, 'ms'); */
};

// 현재 설정을 확인할 수 있는 함수
export const getTurnConfig = () => {
  return { ...TURN_CONFIG };
};
