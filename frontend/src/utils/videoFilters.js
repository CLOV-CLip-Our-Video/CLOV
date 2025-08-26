/* eslint-disable */
// utils/videoFilters.js - 비디오 필터 관련 유틸리티

/**
 * 사용 가능한 비디오 필터 목록
 * - CSS filter 속성을 활용한 실시간 필터 적용
 * - 각 필터는 최적화된 값으로 고정 (사용자 조절 불가)
 */
export const VIDEO_FILTERS = [
  {
    id: 'none',
    name: '원본',
    preview: '🎨',
    type: 'none',
    cssFilter: 'none',
    description: '원본 영상 그대로',
  },
  {
    id: 'sepia',
    name: '세피아',
    preview: '🟤',
    type: 'filter',
    cssFilter: 'sepia(0.8) saturate(1.2) contrast(1.1)',
    description: '따뜻한 갈색 톤',
  },
  {
    id: 'grayscale',
    name: '흑백',
    preview: '⚫',
    type: 'filter', 
    cssFilter: 'grayscale(1) contrast(1.1) brightness(1.05)',
    description: '클래식한 흑백',
  },
  {
    id: 'vintage',
    name: '빈티지',
    preview: '📸',
    type: 'filter',
    cssFilter: 'sepia(0.4) saturate(0.8) contrast(1.2) brightness(0.95) hue-rotate(15deg)',
    description: '레트로 감성',
  },
  {
    id: 'warm',
    name: '술톤',
    preview: '🔥',
    type: 'filter',
    cssFilter: 'saturate(1.3) contrast(1.1) brightness(1.05) hue-rotate(-10deg)',
    description: '따뜻한 색감',
  },
  {
    id: 'cool',
    name: '뽀샤시',
    preview: '❄️',
    type: 'filter',
    cssFilter: 'saturate(0.8) contrast(0.8) brightness(1.2) hue-rotate(20deg)',
    description: '차가운 색감',
  },
  {
    id: 'dramatic',
    name: '드라마틱',
    preview: '🎭',
    type: 'filter',
    cssFilter: 'contrast(1.4) saturate(1.1) brightness(0.95)',
    description: '강렬한 대비',
  },
  {
    id: 'soft',
    name: '소프트',
    preview: '🌸',
    type: 'filter',
    cssFilter: 'blur(0.3px) brightness(1.1) saturate(0.9) contrast(0.95)',
    description: '부드러운 느낌',
  },
];

/**
 * 필터 ID로 필터 객체 찾기
 * @param {string} filterId - 필터 ID
 * @returns {Object|null} 필터 객체 또는 null
 */
export const getFilterById = (filterId) => {
  return VIDEO_FILTERS.find(filter => filter.id === filterId) || null;
};

/**
 * 필터명으로 필터 객체 찾기
 * @param {string} filterName - 필터명
 * @returns {Object|null} 필터 객체 또는 null
 */
export const getFilterByName = (filterName) => {
  return VIDEO_FILTERS.find(filter => filter.name === filterName) || null;
};

/**
 * 캔버스에 필터 적용
 * @param {HTMLCanvasElement} canvas - 대상 캔버스
 * @param {Object} filter - 필터 객체
 * @param {number} opacity - 투명도 (0-100)
 */
export const applyFilterToCanvas = (canvas, filter = null, opacity = 100) => {
  if (!canvas) return;
  
  try {
    // 필터 적용
    if (filter && filter.cssFilter && filter.id !== 'none') {
      canvas.style.filter = filter.cssFilter;
    } else {
      canvas.style.filter = 'none';
    }
    
    // 투명도 적용
    canvas.style.opacity = Math.max(0, Math.min(100, opacity)) / 100;
    
  } catch (error) {
    /* console.error('❌ 필터 적용 실패:', error); */
    // 오류 발생 시 기본값으로 복원
    canvas.style.filter = 'none';
    canvas.style.opacity = '1';
  }
};

/**
 * 필터와 투명도를 함께 적용하는 통합 함수
 * @param {HTMLCanvasElement} canvas - 대상 캔버스
 * @param {Object} options - 설정 옵션
 * @param {Object} options.filter - 적용할 필터
 * @param {number} options.opacity - 투명도 (0-100)
 * @param {number} options.size - 크기 (50-200, 백분율)
 */
export const applyEffectsToCanvas = (canvas, options = {}) => {
  const {
    filter = null,
    opacity = 100,
    size = 100,
  } = options;
  
  if (!canvas) return;
  
  try {
    // 필터 적용
    applyFilterToCanvas(canvas, filter, opacity);
    
    // 크기 적용 (transform scale)
    const scaleValue = Math.max(0.5, Math.min(2, size / 100));
    
    // 기존 transform 보존하면서 scale만 적용
    const currentTransform = canvas.style.transform || '';
    const transformWithoutScale = currentTransform.replace(/scale\([^)]*\)/g, '').trim();
    
    canvas.style.transform = `${transformWithoutScale} scale(${scaleValue})`.trim();
    canvas.style.transformOrigin = 'center center';
    
  } catch (error) {
    /* console.error('❌ 이펙트 적용 실패:', error); */
  }
};

/**
 * 캔버스 이펙트 초기화 (모든 효과 제거)
 * @param {HTMLCanvasElement} canvas - 대상 캔버스
 */
export const resetCanvasEffects = (canvas) => {
  if (!canvas) return;
  
  try {
    canvas.style.filter = 'none';
    canvas.style.opacity = '1';
    canvas.style.transform = '';
    canvas.style.transformOrigin = '';
  } catch (error) {
    /* console.error('❌ 이펙트 초기화 실패:', error); */
  }
};

/**
 * 필터 미리보기 생성 (작은 캔버스에 적용)
 * @param {HTMLCanvasElement} sourceCanvas - 원본 캔버스
 * @param {Object} filter - 적용할 필터
 * @param {number} previewSize - 미리보기 크기 (픽셀)
 * @returns {HTMLCanvasElement} 미리보기 캔버스
 */
export const createFilterPreview = (sourceCanvas, filter, previewSize = 120) => {
  if (!sourceCanvas) return null;
  
  try {
    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d');
    
    previewCanvas.width = previewSize;
    previewCanvas.height = previewSize;
    
    // 필터 적용하여 미리보기 생성
    if (filter && filter.cssFilter && filter.id !== 'none') {
      ctx.filter = filter.cssFilter;
    }
    
    // 원본 캔버스 내용을 미리보기 크기로 그리기
    ctx.drawImage(
      sourceCanvas, 
      0, 0, sourceCanvas.width, sourceCanvas.height,
      0, 0, previewSize, previewSize
    );
    
    return previewCanvas;
    
  } catch (error) {
    /* console.error('❌ 필터 미리보기 생성 실패:', error); */
    return null;
  }
};

/**
 * 필터 적용 가능 여부 확인
 * @param {HTMLCanvasElement} canvas - 대상 캔버스
 * @returns {boolean} 적용 가능 여부
 */
export const canApplyFilter = (canvas) => {
  if (!canvas) return false;
  
  try {
    // 캔버스가 유효하고 컨텍스트를 가져올 수 있는지 확인
    const ctx = canvas.getContext('2d');
    return ctx && canvas.width > 0 && canvas.height > 0;
  } catch (error) {
    /* console.error('❌ 필터 적용 가능성 확인 실패:', error); */
    return false;
  }
};

/**
 * 개발용: 모든 필터 이름 목록 반환
 * @returns {string[]} 필터 이름 배열
 */
export const getAllFilterNames = () => {
  return VIDEO_FILTERS.map(filter => filter.name);
};

/**
 * 개발용: 필터 정보 로깅
 * @param {Object} filter - 로깅할 필터
 */
export const logFilterInfo = (filter) => {
  if (!filter) {
    /* console.log('🎨 필터: 없음 (원본)'); */
    return;
  }
  
  /* console.log(`🎨 필터 적용: ${filter.preview} ${filter.name}`); */
  /* console.log(`   - ID: ${filter.id}`); */
  /* console.log(`   - CSS: ${filter.cssFilter}`); */
  /* console.log(`   - 설명: ${filter.description}`); */
};
