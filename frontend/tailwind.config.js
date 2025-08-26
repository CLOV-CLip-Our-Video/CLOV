/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS 변수를 Tailwind 색상으로 매핑
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          darker: 'var(--color-primary-darker)',
        },
        background: 'var(--color-background)',
        card: 'var(--color-card-background)',
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          light: 'var(--color-text-light)',
        },
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
      },
      backgroundColor: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        card: 'var(--color-card-background)',
        background: 'var(--color-background)',
      },
      textColor: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-darker)',
        secondary: 'var(--color-text-secondary)',
        light: 'var(--color-text-light)',
      },
      borderColor: {
        primary: 'var(--color-primary-darker)',
        default: 'var(--border-color-default)',
        focus: 'var(--border-color-focus)',
        error: 'var(--border-color-error)',
        success: 'var(--border-color-success)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        button: 'var(--shadow-button)',
        hover: 'var(--shadow-hover)',
      },
      borderRadius: {
        small: 'var(--border-radius-small)',
        medium: 'var(--border-radius-medium)',
        large: 'var(--border-radius-large)',
        xl: 'var(--border-radius-xl)',
      },
    },
  },
  plugins: [],
};
