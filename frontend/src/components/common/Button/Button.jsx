/* eslint-disable react/prop-types */
import { twMerge } from 'tailwind-merge';

/**
 * 확장된 공통 Button 컴포넌트 (CSS 변수 기반 색상 연동)
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning'} [props.variant='primary']
 * @param {'small' | 'medium' | 'large'} [props.size='medium']
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]
 * @param {string} [props.className]
 * @param {'button' | 'submit' | 'reset'} [props.type='button']
 * @param {React.ReactNode} props.children
 * @param {Object} [props.rest]
 */

export default function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  // 기본 스타일
  const base = `
  inline-flex items-center justify-center font-medium transition-all duration-200
  rounded-medium focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

  // 크기별 스타일
  const sizes = {
    xsmall: 'px-2 py-1 text-xs',
    small: 'px-3 py-1.5 text-sm min-w-20',
    medium: 'px-4 py-2 text-base min-w-24',
    large: 'px-6 py-3 text-lg min-w-32',
  };

  // 변형별 스타일
  const variants = {
    primary: `
      bg-[var(--color-button-background)]
      text-[var(--color-button-text)]
      hover:bg-[var(--color-button-hover)]
      focus:ring-[var(--color-primary)]
      shadow-[var(--shadow-button)]
      hover:shadow-[var(--shadow-hover)]
    `,
    secondary: `
      bg-gray-200
      text-gray-700
      hover:bg-gray-300
      focus:ring-gray-300
      border border-gray-300
    `,
    outline: `
      bg-transparent
      border-2
      border-[var(--color-primary)]
      text-[var(--color-primary)]
      hover:bg-[var(--color-primary)]
      hover:text-white
      focus:ring-[var(--color-primary)]
    `,
    danger: `
      bg-[var(--color-error)]
      text-white
      hover:bg-red-700
      focus:ring-red-300
    `,
    success: `
      bg-[var(--color-success)]
      text-white
      hover:bg-green-700
      focus:ring-green-300
    `,
    warning: `
      bg-[var(--color-warning)]
      text-black
      hover:bg-yellow-600
      focus:ring-yellow-300
    `,
  };

  // 로딩 스피너
  const LoadingSpinner = () => (
    <svg className='w-4 h-4 mr-2 animate-spin' fill='none' viewBox='0 0 24 24'>
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  );

  // variant 유효성 검사
  if (!variants[variant]) {
    console.warn(
      `⚠️ [Button 컴포넌트] "${variant}"는 유효하지 않은 variant입니다. 기본값(primary)으로 대체됩니다.`
    );
  }

  // size 유효성 검사
  if (!sizes[size]) {
    console.warn(
      `⚠️ [Button 컴포넌트] "${size}"는 유효하지 않은 size입니다. 기본값(medium)으로 대체됩니다.`
    );
  }

  const mergedClassName = twMerge(
    base,
    sizes[size] || sizes.medium,
    variants[variant] || variants.primary,
    loading && 'cursor-wait',
    className
  );

  return (
    <button
      type={type}
      className={mergedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}

// 추가 유틸리티 함수들
Button.Sizes = {
  XS: 'xsmall',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

Button.Variants = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  DANGER: 'danger',
  SUCCESS: 'success',
  WARNING: 'warning',
};
