/* eslint-disable */
import React from 'react';

const IntroSection = () => {
  return (
    <div className='mb-6 sm:mb-8 md:mb-10'>
      <h2
        className='text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight'
        style={{
          color: 'var(--color-text)',
        }}
      >
        <span className='block sm:inline'>멀리 있어도</span>{' '}
        <span
          className='relative inline-block'
          style={{
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-primary-light)',
          }}
        >
          같은 프레임
        </span>{' '}
        <span className='block sm:inline'>안에서</span>
      </h2>
      <div className='space-y-1 sm:space-y-2'>
        <p
          className='text-base sm:text-lg md:text-xl leading-relaxed'
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          친구들과 실시간으로 영상을 촬영하고
        </p>
        <p
          className='text-base sm:text-lg md:text-xl leading-relaxed'
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          특별한 추억을 함께 만들어보세요
        </p>
      </div>
    </div>
  );
};

export default IntroSection;