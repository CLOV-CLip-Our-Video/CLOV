/* eslint-disable */
import { create } from 'zustand';

const useRecordingStore = create((set, get) => ({
  // 기존 영상 상태
  isRecording: false,
  recordedVideo: null, // Blob URL (즉시 미리보기용)
  recordedVideoBlob: null, // Blob 객체 (다운로드용)
  serverVideoUrl: null, // 서버 URL (히스토리/공유용)
  recordingStartTime: null,
  recordingDuration: 0,
  isUploading: false, // 서버 업로드 진행 상태
  uploadProgress: 0, // 업로드 진행률 (0-100)
  uploadError: null, // 업로드 에러 메시지

  // 🆕 사진 촬영 상태
  capturedPhoto: null, // 사진 Blob URL
  capturedPhotoBlob: null, // 사진 Blob 객체
  isCountingDown: false, // 카운트다운 진행 상태
  countdown: 0, // 현재 카운트 (3,2,1,0)

  // MediaRecorder 관련 (영상 녹화용)
  mediaRecorder: null,
  recordedChunks: [],

  // 기존 액션들
  setRecording: (recording) => set({ isRecording: recording }),
  setRecordedVideo: (video) => set({ recordedVideo: video }),
  setRecordingStartTime: (time) => set({ recordingStartTime: time }),
  setRecordingDuration: (duration) => set({ recordingDuration: duration }),
  setRecordedVideoBlob: (blob) => set({ recordedVideoBlob: blob }),
  setServerVideoUrl: (url) => set({ serverVideoUrl: url }),
  setUploading: (uploading) => set({ isUploading: uploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setUploadError: (error) => set({ uploadError: error }),

  // 🆕 사진 관련 액션들
  setCapturedPhoto: (photo) => set({ capturedPhoto: photo }),
  setCapturedPhotoBlob: (blob) => set({ capturedPhotoBlob: blob }),
  setCountingDown: (counting) => set({ isCountingDown: counting }),
  setCountdown: (count) => set({ countdown: count }),

  // 🆕 사진 촬영 카운트다운 시작
  startPhotoCountdown: () => {
    return new Promise((resolve) => {
      set({ isCountingDown: true, countdown: 3 });

      const countdownInterval = setInterval(() => {
        const currentCount = get().countdown;

        if (currentCount > 1) {
          set({ countdown: currentCount - 1 });
        } else {
          // 카운트다운 완료
          clearInterval(countdownInterval);
          set({ isCountingDown: false, countdown: 0 });
          resolve(); // 카운트다운 완료 신호
        }
      }, 1000);
    });
  },

  // 🆕 사진 캡처 실행 (캔버스에서 호출)
  capturePhoto: (canvas) => {
    return new Promise((resolve, reject) => {
      try {
        // 🔧 렌더링 완료를 위한 강제 대기
        const captureAfterRender = () => {
          // 한 프레임 더 대기하여 렌더링 완료 보장
          requestAnimationFrame(() => {
            // /* console.log('📸 렌더링 완료 후 캡처 시작'); */

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const photoUrl = URL.createObjectURL(blob);
                  const timestamp = Date.now();

                  set({
                    capturedPhoto: photoUrl,
                    capturedPhotoBlob: blob,
                  });

                  // console.log('✅ 사진 촬영 완료:', {
                  // size: blob.size,
                  // type: blob.type,
                  // timestamp,
                  // dimensions: `${canvas.width}x${canvas.height}`
                  // });

                  resolve({
                    blob,
                    url: photoUrl,
                    fileName: `CLOV_photo_${timestamp}.png`,
                    type: 'photo',
                    timestamp,
                  });
                } else {
                  reject(new Error('사진 생성에 실패했습니다.'));
                }
              },
              'image/png',
              0.95
            );
          });
        };

        // 🔧 추가 렌더링 대기 (비동기 렌더링 완료 보장)
        setTimeout(captureAfterRender, 100); // 0.1초 대기
      } catch (error) {
        /* console.error('❌ 사진 촬영 오류:', error); */
        reject(error);
      }
    });
  },

  // 🆕 전체 사진 촬영 프로세스 (카운트다운 + 촬영)
  takePhoto: async (canvas) => {
    try {
      // 1. 카운트다운 시작
      await get().startPhotoCountdown();

      // 2. 사진 촬영
      const photoData = await get().capturePhoto(canvas);

      return photoData;
    } catch (error) {
      set({ isCountingDown: false, countdown: 0 });
      throw error;
    }
  },

  // 영상 녹화 시작 (기존 개선)
// 영상 녹화 시작 (MP4 최적화)
startRecording: (canvas) => {
  try {
    // 캔버스 스트림 생성 (30fps)
    const stream = canvas.captureStream(30);

    // 🔧 브라우저별 MP4 호환성 체크 및 최적화
    let options = {};
    
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      options.mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
      options.mimeType = 'video/mp4;codecs=h264';
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      options.mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      // MP4 지원 안될 때 fallback
      options.mimeType = 'video/webm;codecs=vp9';
      /* console.warn('⚠️ MP4 미지원, WebM으로 대체'); */
    } else {
      // 기본값 (브라우저가 알아서 선택)
      /* console.warn('⚠️ 코덱 지정 없이 기본 설정 사용'); */
    }

    // 비트레이트 설정 (MP4에 최적화)
    options.videoBitsPerSecond = 2500000; // 2.5Mbps

    // MediaRecorder 생성
    const mediaRecorder = new MediaRecorder(stream, options);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // 🔧 MIME 타입에 따른 Blob 생성
      const finalMimeType = mediaRecorder.mimeType || 'video/mp4';
      const blob = new Blob(chunks, { type: finalMimeType });
      const videoUrl = URL.createObjectURL(blob);
      const timestamp = Date.now();

      set({
        recordedVideo: videoUrl,
        recordedVideoBlob: blob,
        isRecording: false,
        recordingStartTime: null,
      });

      console.log('✅ 영상 녹화 완료:', {
        size: blob.size,
        type: blob.type,
        actualMimeType: mediaRecorder.mimeType,
        timestamp
      });

      // 자동 서버 업로드 시도
      get()
        .uploadToServer(blob)
        .catch((error) => {
          /* console.error('자동 업로드 실패:', error); */
          set({
            uploadError: '서버에 저장되지 않습니다. 지금만 다운로드 가능합니다.',
            isUploading: false,
          });
        });
    };

    mediaRecorder.start(1000); // 1초마다 데이터 수집

    set({
      isRecording: true,
      mediaRecorder,
      recordedChunks: chunks,
      recordingStartTime: Date.now(),
      recordingDuration: 0,
      uploadError: null,
    });

    /* console.log('✅ 영상 녹화 시작 - 타입:', options.mimeType || '기본'); */
  } catch (error) {
    /* console.error('❌ 영상 녹화 시작 실패:', error); */
    throw error;
  }
},

  // 영상 녹화 중지 (기존 개선)
  stopRecording: () => {
    const { mediaRecorder } = get();

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      // /* console.log('🛑 영상 녹화 중지'); */
    }
  },

  // 기존 서버 업로드 함수 (import 추가 필요)
  uploadToServer: async (blob) => {
    console.log("업로드는 아직 구현되지 않았습니다!")
    return
    // 동적 import로 순환 참조 방지
    const { default: useRoomStore } = await import('./roomStore');
    const { roomCode } = useRoomStore.getState();

    try {
      set({ isUploading: true, uploadProgress: 0 });

      const formData = new FormData();
      formData.append('video', blob);
      formData.append('roomCode', roomCode);
      formData.append('timestamp', Date.now());

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            set({ uploadProgress: progress });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            set({
              serverVideoUrl: response.videoUrl,
              isUploading: false,
              uploadProgress: 100,
            });
            resolve(response.videoUrl);
          } else {
            reject(new Error(`서버 응답 오류: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('네트워크 오류'));
        });

        xhr.open('POST', `/api/v1/rooms/${roomCode}/videos`);
        xhr.send(formData);
      });
    } catch (error) {
      set({
        isUploading: false,
        uploadProgress: 0,
        uploadError: error.message,
      });
      throw error;
    }
  },

  // 상태 초기화 (사진 포함)
  resetRecording: () => {
    const { recordedVideo, capturedPhoto } = get();

    // Blob URL 정리
    if (recordedVideo && recordedVideo.startsWith('blob:')) {
      URL.revokeObjectURL(recordedVideo);
    }
    if (capturedPhoto && capturedPhoto.startsWith('blob:')) {
      URL.revokeObjectURL(capturedPhoto);
    }

    set({
      // 영상 상태 초기화
      isRecording: false,
      recordedVideo: null,
      recordedVideoBlob: null,
      serverVideoUrl: null,
      recordingStartTime: null,
      recordingDuration: 0,
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
      mediaRecorder: null,
      recordedChunks: [],

      // 🆕 사진 상태 초기화
      capturedPhoto: null,
      capturedPhotoBlob: null,
      isCountingDown: false,
      countdown: 0,
    });
  },

  // 히스토리에서 비디오 로드 (기존 유지)
  loadFromHistory: (serverUrl) => {
    set({
      recordedVideo: null,
      recordedVideoBlob: null,
      serverVideoUrl: serverUrl,
      isUploading: false,
      uploadProgress: 100,
    });
  },
}));

export default useRecordingStore;
