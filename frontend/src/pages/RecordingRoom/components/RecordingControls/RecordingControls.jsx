/* eslint-disable */
import Button from '../../../../components/common/Button/Button.jsx';
import styles from './RecordingControls.module.css';

const RecordingControls = ({
  isRecording,
  isCountingDown,
  onStartRecording,
  onStopRecording,
  onTakePhoto,
  onShowHelp,
  disabled = false,
}) => {
  // 버튼 비활성화 조건 계산
  const isDisabled = disabled || isCountingDown;
  const isPhotoDisabled = isDisabled || isRecording; // 녹화 중에는 사진 촬영 불가
  const isVideoDisabled = isDisabled; // 카운트다운 중에만 영상 버튼 비활성화

  return (
    <div
      className={`
      flex items-center justify-center gap-4 mt-6 flex-wrap
      ${styles.controlsContainer}
    `}
    >
      {/* 📸 사진 촬영 버튼 */}
      <Button
        variant={Button.Variants.PRIMARY}
        size={Button.Sizes.LARGE}
        onClick={onTakePhoto}
        disabled={isPhotoDisabled}
        className={`
          px-8 py-4 text-lg font-bold transition-all duration-200
          ${styles.recordButton}
          ${isCountingDown ? 'animate-pulse opacity-50' : ''}
          ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className='flex items-center gap-2'>
          {isCountingDown ? (
            <>
              {/* <span className='animate-spin'>⏳</span> */}
              촬영 준비 중...
            </>
          ) : isRecording ? (
            <>
              {/* <span className='opacity-50'>📸</span> */}
              사진 촬영
              <span className='text-xs opacity-70'>(녹화 중 불가)</span>
            </>
          ) : (
            <>사진 촬영</>
          )}
        </span>
      </Button>

      {/* 🎬 영상 녹화 시작/중지 버튼 */}
      {!isRecording ? (
        <Button
          variant={Button.Variants.SUCCESS}
          size={Button.Sizes.LARGE}
          onClick={onStartRecording}
          disabled={isVideoDisabled}
          className={`
            px-8 py-4 text-lg font-bold transition-all duration-200
            ${styles.recordButton}
            ${isCountingDown ? 'animate-pulse opacity-50' : ''}
          `}
        >
          <span className='flex items-center gap-2'>
            {isCountingDown ? (
              <>
                <span className='animate-spin'>⏳</span>
                잠시만 기다려주세요...
              </>
            ) : (
              <>영상 촬영</>
            )}
          </span>
        </Button>
      ) : (
        <Button
          variant={Button.Variants.DANGER}
          size={Button.Sizes.LARGE}
          onClick={onStopRecording}
          disabled={isCountingDown} // 카운트다운 중에는 중지도 불가
          className={`
            px-8 py-4 text-lg font-bold transition-all duration-200
            ${styles.stopButton}
            ${isCountingDown ? 'opacity-50' : 'animate-pulse'}
          `}
        >
          <span className='flex items-center gap-2'>
            {isCountingDown ? (
              <>
                <span className='animate-spin'>⏳</span>
                처리 중...
              </>
            ) : (
              <>
                <span className='w-2 h-2 bg-white rounded-full animate-pulse mr-1'></span>
                녹화 완료
              </>
            )}
          </span>
        </Button>
      )}

      {/* 도움말 버튼 */}
      <Button
        variant={Button.Variants.OUTLINE}
        size={Button.Sizes.LARGE}
        onClick={onShowHelp}
        disabled={isDisabled}
        className={`
          px-8 py-4 text-lg font-bold transition-all duration-200
          ${styles.recordButton}
          ${isCountingDown ? 'animate-pulse opacity-50' : ''}
        `}
        title='사용법 안내'
      >
        <span className='flex items-center gap-2'>도움말</span>
      </Button>

      {/* 상태 안내 텍스트 */}
      {/* {(isCountingDown || isRecording) && (
        <div className='w-full flex justify-center mt-2'>
          <div className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
            {isCountingDown && '사진 촬영을 위해 준비 중입니다...'}
            {isRecording && '영상이 녹화되고 있습니다. 완료 버튼을 누르세요.'}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default RecordingControls;
