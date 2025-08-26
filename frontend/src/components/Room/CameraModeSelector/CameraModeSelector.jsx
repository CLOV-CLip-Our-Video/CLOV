/* eslint-disable */
/**
 * 카메라 모드 라벨 매핑
 * 키는 모드 이름, 값은 사용자에게 보여질 텍스트
 */

const CAMERA_MODE_LABELS = {
  ORIGINAL: '배경 표시',
  PERSON: '배경 제거',
  FACE_ONLY: '얼굴만',
};

/**
 * CameraModeSelector - 카메라 모드 선택 버튼 UI
 *
 * @param {Object} props
 * @param {Object} props.cameraModes - 사용 가능한 카메라 모드 객체 
 * @param {number} props.currentMode - 현재 선택된 카메라 모드 값
 * @param {function} props.onChange - 모드 변경 시 호출될 콜백 함수 (선택된 모드 값이 인자로 전달됨)
 */
export default function CameraModeSelector({
  cameraModes,
  currentMode,
  onChange,
}) {
  return (
    <div className='flex w-full my-4 border border-[var(--border-color-default)] rounded-lg overflow-hidden'>
      {/* 각 카메라 모드에 대한 버튼 생성 */}
      {Object.entries(cameraModes).map(([key, value], index, array) => (
        <button
          key={key}
          onClick={() => onChange(value)} // 버튼 클릭 시 모드 값 전달
          className={`
            flex-1 py-1 px-3 text-sm font-medium transition-all duration-200
            ${
              currentMode === value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-card-background)] text-[var(--color-text)] hover:bg-[var(--color-background)]'
            }
            ${index < array.length - 1 ? 'border-r border-[var(--border-color-default)]' : ''}
          `}  
        >
          {CAMERA_MODE_LABELS[key]} {/* 사용자에게 보여질 모드 라벨 */}
        </button>
      ))}
    </div>
  );
}
