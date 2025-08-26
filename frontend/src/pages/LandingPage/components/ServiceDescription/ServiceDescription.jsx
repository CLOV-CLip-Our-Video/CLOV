/* eslint-disable */
import React from 'react';

const ServiceDescription = () => {
  return (
    <div className='w-full max-w-4xl mx-auto text-center flex flex-col justify-center h-full'>
      <div className='flex-shrink-0 mb-4 sm:mb-6'>
        <h2 
          className='font-bold mb-3 sm:mb-4'
          style={{ 
            color: 'var(--color-text)',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            lineHeight: '1.2'
          }}
        >
          원격으로 함께하는
          <br />
          <span 
            className='inline-block px-2 py-1 rounded-lg'
            style={{ 
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-text)'
            }}
          >
            새로운 촬영 경험
          </span>
        </h2>
        <p 
          className='leading-relaxed mb-4 sm:mb-6'
          style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.25rem)',
            lineHeight: '1.4'
          }}
        >
          WebRTC 기술을 활용하여 멀리 떨어진 친구들과<br className='hidden sm:block' />
          실시간으로 소통하며 특별한 순간을 기록하세요
        </p>
      </div>

      <div className='flex-1 flex items-center justify-center min-h-0'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full'>
          <div className='text-center'>
            <div 
              className='mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center'
              style={{ 
                backgroundColor: 'var(--color-primary-light)',
                width: 'clamp(3rem, 8vw, 5rem)',
                height: 'clamp(3rem, 8vw, 5rem)',
                fontSize: 'clamp(1.2rem, 3vw, 2rem)'
              }}
            >
              🌐
            </div>
            <h3 
              className='font-bold mb-1 sm:mb-2'
              style={{ 
                color: 'var(--color-text)',
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'
              }}
            >
              실시간 연결
            </h3>
            <p 
              style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                lineHeight: '1.3'
              }}
            >
              WebRTC로 지연 없는<br />실시간 화상 통신
            </p>
          </div>

          <div className='text-center'>
            <div 
              className='mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center'
              style={{ 
                backgroundColor: 'var(--color-primary-light)',
                width: 'clamp(3rem, 8vw, 5rem)',
                height: 'clamp(3rem, 8vw, 5rem)',
                fontSize: 'clamp(1.2rem, 3vw, 2rem)'
              }}
            >
              🎬
            </div>
            <h3 
              className='font-bold mb-1 sm:mb-2'
              style={{ 
                color: 'var(--color-text)',
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'
              }}
            >
              협업 촬영
            </h3>
            <p 
              style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                lineHeight: '1.3'
              }}
            >
              한 캔버스에 모여<br />함께 촬영하고 녹화
            </p>
          </div>

          <div className='text-center'>
            <div 
              className='mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center'
              style={{ 
                backgroundColor: 'var(--color-primary-light)',
                width: 'clamp(3rem, 8vw, 5rem)',
                height: 'clamp(3rem, 8vw, 5rem)',
                fontSize: 'clamp(1.2rem, 3vw, 2rem)'
              }}
            >
              💾
            </div>
            <h3 
              className='font-bold mb-1 sm:mb-2'
              style={{ 
                color: 'var(--color-text)',
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'
              }}
            >
              저장 & 공유
            </h3>
            <p 
              style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                lineHeight: '1.3'
              }}
            >
              촬영한 콘텐츠를<br />쉽게 저장하고 공유
            </p>
          </div>
        </div>
      </div>

      <div className='flex-shrink-0 mt-4 sm:mt-6'>
        <div 
          className='px-4 py-2 rounded-full inline-block'
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--color-text-secondary)',
            backdropFilter: 'blur(8px)',
            fontSize: 'clamp(0.75rem, 2vw, 1rem)'
          }}
        >
          © 2025 CLOV Team
        </div>
      </div>
    </div>
  );
};

export default ServiceDescription;