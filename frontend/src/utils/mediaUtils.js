/* eslint-disable */
// utils/mediaUtils.js - MediaPipe와 TensorFlow.js 로딩 관리

import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { FaceMesh } from '@mediapipe/face_mesh';

// 전역 상태 관리
let blazefaceModel = null;
let blazefaceLoadPromise = null;
let mediaPipeInstances = new Set();

/**
 * 🤖 TensorFlow.js BlazeFace 동적 로딩
 */
export const loadBlazeFace = async () => {
  if (blazefaceModel) {
    return blazefaceModel;
  }

  if (blazefaceLoadPromise) {
    return blazefaceLoadPromise;
  }

  blazefaceLoadPromise = (async () => {
    try {
      if (!window.tf) {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js',
          'tf-script'
        );
      }

      if (!window.blazeface) {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js',
          'blazeface-script'
        );
      }

      if (window.blazeface && !blazefaceModel) {
        blazefaceModel = await window.blazeface.load();
      }

      return blazefaceModel;
    } catch (error) {
      blazefaceLoadPromise = null;
      throw new Error(`BlazeFace 로딩 실패: ${error.message}`);
    }
  })();

  return blazefaceLoadPromise;
};

/**
 * 📜 스크립트 동적 로딩 헬퍼
 */
const loadScript = (src, id) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
};

/**
 * 🎭 MediaPipe SelfieSegmentation 인스턴스 생성
 */
export const createSelfieSegmentation = async (options = {}) => {
  try {
    const {
      modelSelection = 1,
      locateFile = (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`,
    } = options;

    const selfieSegmentation = new SelfieSegmentation({
      locateFile,
    });

    selfieSegmentation.setOptions({
      modelSelection,
    });

    mediaPipeInstances.add(selfieSegmentation);
    return selfieSegmentation;
  } catch (error) {
    throw new Error(`MediaPipe SelfieSegmentation 초기화 실패: ${error.message}`);
  }
};

/**
 * 🎭 MediaPipe FaceMesh 인스턴스 생성 (새로 추가)
 */
export const createFaceMesh = async (options = {}) => {
  try {
    
    const {
      maxNumFaces = 1,
      refineLandmarks = false,
      minDetectionConfidence = 0.7,
      minTrackingConfidence = 0.5,
      locateFile = (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    } = options;

    const faceMesh = new FaceMesh({
      locateFile,
    });
    console.log(faceMesh)
    faceMesh.setOptions({
      maxNumFaces,
      refineLandmarks,
      minDetectionConfidence,
      minTrackingConfidence,
    });

    mediaPipeInstances.add(faceMesh);
    // console.log('✅ MediaPipe FaceMesh 생성 완료',faceMesh);
    return faceMesh;
  } catch (error) {
    console.error('❌ MediaPipe FaceMesh 생성 실패:', error);
    throw new Error(`MediaPipe FaceMesh 초기화 실패: ${error.message}`);
  }
};

/**
 * 🔧 MediaPipe 인스턴스 안전 정리
 */
export const cleanupSelfieSegmentation = (selfieSegmentation) => {
  if (!selfieSegmentation) return;

  try {
    selfieSegmentation.onResults = null;

    if (typeof selfieSegmentation.close === 'function') {
      selfieSegmentation.close();
    }

    mediaPipeInstances.delete(selfieSegmentation);
  } catch (error) {
    // 조용히 무시
  }
};

/**
 * 🧹 모든 MediaPipe 인스턴스 정리
 */
export const cleanupAllMediaPipeInstances = () => {
  mediaPipeInstances.forEach((instance) => {
    cleanupSelfieSegmentation(instance);
  });

  mediaPipeInstances.clear();
};

/**
 * 📊 BlazeFace 모델 상태 확인
 */
export const getBlazeFaceStatus = () => {
  return {
    isLoaded: !!blazefaceModel,
    isLoading: !!blazefaceLoadPromise && !blazefaceModel,
    canDetectFaces: !!blazefaceModel,
    model: blazefaceModel,
  };
};

/**
 * 📊 MediaPipe 상태 확인
 */
export const getMediaPipeStatus = () => {
  return {
    isAvailable: !!window.SelfieSegmentation || !!SelfieSegmentation,
    activeInstances: mediaPipeInstances.size,
    canProcessSegmentation: mediaPipeInstances.size > 0,
  };
};

/**
 * 🎯 얼굴 감지 실행 (BlazeFace 래퍼)
 */
export const detectFaces = async (video, returnTensors = false) => {
  if (!blazefaceModel) {
    throw new Error('BlazeFace 모델이 로딩되지 않았습니다');
  }

  if (!video || video.videoWidth <= 0) {
    throw new Error('유효하지 않은 비디오 요소입니다');
  }

  try {
    const predictions = await blazefaceModel.estimateFaces(
      video,
      returnTensors
    );
    return predictions;
  } catch (error) {
    throw new Error(`얼굴 감지 실패: ${error.message}`);
  }
};

/**
 * 🔄 MediaPipe 결과 처리 안전 래퍼
 */
export const setupMediaPipeResults = (
  selfieSegmentation,
  onResults,
  options = {}
) => {
  if (!selfieSegmentation || typeof onResults !== 'function') {
    throw new Error('유효하지 않은 MediaPipe 설정');
  }

  const { enableErrorHandling = true, logErrors = true } = options;

  const safeOnResults = async (results) => {
    try {
      await onResults(results);
    } catch (error) {
      if (logErrors) {
        if (!error.message.includes('BindingError')) {
          // MediaPipe 오류 로깅
        }
      }

      if (!enableErrorHandling) {
        throw error;
      }
    }
  };

  selfieSegmentation.onResults = safeOnResults;
};

/**
 * 📤 MediaPipe에 비디오 프레임 전송
 */
export const sendVideoToMediaPipe = async (
  video,
  selfieSegmentation,
  onResults
) => {
  if (!selfieSegmentation || !video) return false;

  if (video.videoWidth <= 0 || video.videoHeight <= 0) {
    return false;
  }

  try {
    if (onResults && typeof onResults === 'function') {
      selfieSegmentation.onResults = onResults;
    }

    await selfieSegmentation.send({ image: video });
    return true;
  } catch (error) {
    if (!error.message.includes('BindingError')) {
      // 오류 로깅
    }
    return false;
  }
};

/**
 * 🔧 브라우저 호환성 확인
 */
export const checkBrowserCompatibility = () => {
  const compatibility = {
    webgl: false,
    webAssembly: false,
    mediaDevices: false,
    canvas: false,
    isCompatible: false,
  };

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    compatibility.webgl = !!gl;

    compatibility.webAssembly = typeof WebAssembly === 'object';

    compatibility.mediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    compatibility.canvas = !!document.createElement('canvas').getContext;

    compatibility.isCompatible =
      compatibility.webgl &&
      compatibility.webAssembly &&
      compatibility.mediaDevices &&
      compatibility.canvas;
  } catch (error) {
    // 오류 무시
  }

  return compatibility;
};

/**
 * 🚀 AI 모델 전체 초기화
 */
export const initializeAIModels = async (options = {}) => {
  const {
    enableBlazeFace = true,
    enableMediaPipe = true,
    mediaPipeOptions = {},
  } = options;

  const results = {
    blazeface: null,
    mediaPipe: null,
    errors: [],
  };

  const compatibility = checkBrowserCompatibility();
  if (!compatibility.isCompatible) {
    const error = '브라우저가 AI 모델을 지원하지 않습니다';
    results.errors.push(error);
    throw new Error(error);
  }

  if (enableBlazeFace) {
    try {
      results.blazeface = await loadBlazeFace();
    } catch (error) {
      results.errors.push(`BlazeFace: ${error.message}`);
    }
  }

  if (enableMediaPipe) {
    try {
      results.mediaPipe = await createSelfieSegmentation(mediaPipeOptions);
    } catch (error) {
      results.errors.push(`MediaPipe: ${error.message}`);
    }
  }

  return results;
};