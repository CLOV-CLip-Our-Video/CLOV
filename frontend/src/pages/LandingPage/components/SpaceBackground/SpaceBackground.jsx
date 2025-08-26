/* eslint-disable */
import React from 'react';
import '../../styles/spaceAnimations.css';

const SpaceBackground = ({ fallingAliens, goldenParticles }) => {
  return (
    <>
      {/* 부드러운 그라데이션 배경 */}
      <div
        className='absolute inset-0 w-full h-full'
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 1) 0%, 
              rgba(255, 252, 240, 0.95) 50%, 
              rgba(255, 248, 220, 0.9) 100%
            )
          `,
        }}
      />

      {/* 외계인 테마 장식적 요소들 */}
      <div className='absolute inset-0 w-full h-full overflow-hidden'>
        {/* 별자리 패턴들 */}
        <div
          className='absolute'
          style={{
            top: '5%',
            right: '5%',
            width: '150px',
            height: '150px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.8) 2px, transparent 2px),
              radial-gradient(circle, rgba(255, 217, 102, 0.6) 1.5px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 217, 102, 0.4) 1px, transparent 1px)
            `,
            backgroundPosition: '0 0, 20px 15px, 40px 30px, 60px 45px, 80px 60px, 100px 75px',
            backgroundSize: '30px 30px',
            animation: 'constellationTwinkle 6s ease-in-out infinite',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '15%',
            right: '20%',
            width: '100px',
            height: '100px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.7) 1.5px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 1px, transparent 1px),
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 0.8px, transparent 0.8px)
            `,
            backgroundPosition: '0 0, 15px 10px, 30px 20px, 45px 30px',
            backgroundSize: '25px 25px',
            animation: 'constellationTwinkle 5s ease-in-out infinite 1s',
          }}
        />

        {/* 성운 효과 */}
        <div
          className='absolute'
          style={{
            top: '25%',
            right: '35%',
            width: '120px',
            height: '120px',
            background: `
              radial-gradient(ellipse, rgba(255, 217, 102, 0.2) 0%, rgba(255, 217, 102, 0.1) 40%, transparent 70%),
              radial-gradient(ellipse at 30% 30%, rgba(255, 217, 102, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(255, 217, 102, 0.1) 0%, transparent 60%)
            `,
            borderRadius: '50%',
            animation: 'nebulaFloat 15s ease-in-out infinite',
            filter: 'blur(2px)',
          }}
        />

        {/* 우주선들 (클릭 가능) */}
        <div
          className='absolute'
          style={{
            top: '40%',
            right: '10%',
            width: '80px',
            height: '50px',
            position: 'relative',
          }}
        >
          {/* 우주선 본체 */}
          <div
            style={{
              width: '60px',
              height: '25px',
              background: `
                linear-gradient(45deg, rgba(255, 217, 102, 0.8) 0%, rgba(255, 217, 102, 0.4) 100%)
              `,
              borderRadius: '12px',
              position: 'absolute',
              top: '12px',
              left: '10px',
              animation: 'spaceship 8s ease-in-out infinite',
              boxShadow: '0 2px 8px rgba(255, 217, 102, 0.3)',
            }}
          />
          {/* 엔진 불꽃 */}
          <div
            style={{
              width: '20px',
              height: '10px',
              background: `
                linear-gradient(90deg, rgba(255, 217, 102, 0.9) 0%, rgba(255, 217, 102, 0.5) 100%)
              `,
              borderRadius: '5px',
              position: 'absolute',
              top: '17px',
              left: '-10px',
              animation: 'engineFlame 0.5s ease-in-out infinite',
            }}
          />
          {/* 우주선 중앙 점 */}
          <div
            style={{
              width: '8px',
              height: '8px',
              background: 'rgba(255, 217, 102, 1)',
              borderRadius: '50%',
              position: 'absolute',
              top: '18px',
              left: '36px',
              animation: 'spaceshipLight 2s ease-in-out infinite',
              boxShadow: '0 0 4px rgba(255, 217, 102, 0.8)',
            }}
          />
        </div>

        <div
          className='absolute'
          style={{
            top: '50%',
            right: '25%',
            width: '70px',
            height: '40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '20px',
              background: `
                linear-gradient(45deg, rgba(255, 217, 102, 0.7) 0%, rgba(255, 217, 102, 0.3) 100%)
              `,
              borderRadius: '10px',
              position: 'absolute',
              top: '10px',
              left: '10px',
              animation: 'spaceship 6s ease-in-out infinite 1s',
              boxShadow: '0 2px 6px rgba(255, 217, 102, 0.3)',
            }}
          />
          <div
            style={{
              width: '15px',
              height: '8px',
              background: `
                linear-gradient(90deg, rgba(255, 217, 102, 0.8) 0%, rgba(255, 217, 102, 0.4) 100%)
              `,
              borderRadius: '4px',
              position: 'absolute',
              top: '16px',
              left: '-5px',
              animation: 'engineFlame 0.4s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '6px',
              height: '6px',
              background: 'rgba(255, 217, 102, 1)',
              borderRadius: '50%',
              position: 'absolute',
              top: '17px',
              left: '32px',
              animation: 'spaceshipLight 1.8s ease-in-out infinite',
              boxShadow: '0 0 3px rgba(255, 217, 102, 0.8)',
            }}
          />
        </div>

        {/* 우주 먼지 구름 */}
        <div
          className='absolute'
          style={{
            top: '50%',
            right: '25%',
            width: '150px',
            height: '100px',
            background: `
              radial-gradient(ellipse, rgba(255, 217, 102, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse at 40% 60%, rgba(255, 217, 102, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(255, 217, 102, 0.06) 0%, transparent 40%)
            `,
            borderRadius: '50%',
            animation: 'dustFloat 20s ease-in-out infinite',
            filter: 'blur(3px)',
          }}
        />

        {/* 우측 하단 - 별자리 패턴 */}
        <div
          className='absolute'
          style={{
            bottom: '10%',
            right: '8%',
            width: '120px',
            height: '120px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.7) 1.8px, transparent 1.8px),
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 1.2px, transparent 1.2px),
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 0.8px, transparent 0.8px)
            `,
            backgroundPosition: '0 0, 25px 20px, 50px 40px, 75px 60px',
            backgroundSize: '35px 35px',
            animation: 'constellationTwinkle 7s ease-in-out infinite 2s',
          }}
        />

        <div
          className='absolute'
          style={{
            bottom: '20%',
            right: '20%',
            width: '90px',
            height: '90px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.6) 0%, rgba(255, 217, 102, 0.3) 65%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetBounce 4s ease-in-out infinite 0.8s',
          }}
        />

        {/* 중앙 우측 - 큰 우주 배경 */}
        <div
          className='absolute'
          style={{
            top: '50%',
            right: '2%',
            width: '400px',
            height: '400px',
            background: `
              radial-gradient(circle at 30% 30%, rgba(255, 217, 102, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255, 217, 102, 0.1) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(255, 217, 102, 0.05) 0%, transparent 80%)
            `,
            borderRadius: '50%',
            transform: 'translateY(-50%)',
            animation: 'spaceRotate 25s linear infinite',
          }}
        />

        {/* 좌측 상단 - 작은 행성들 */}
        <div
          className='absolute'
          style={{
            top: '8%',
            left: '15%',
            width: '60px',
            height: '60px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.4) 0%, rgba(255, 217, 102, 0.2) 70%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetFloat 9s ease-in-out infinite 3s',
          }}
        />

        {/* 좌측 하단 - 별자리와 성운 */}
        <div
          className='absolute'
          style={{
            bottom: '30%',
            left: '10%',
            width: '150px',
            height: '100px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.6) 2px, transparent 2px),
              radial-gradient(circle, rgba(255, 217, 102, 0.4) 1.5px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 1px, transparent 1px),
              radial-gradient(ellipse, rgba(255, 217, 102, 0.1) 0%, transparent 70%)
            `,
            backgroundPosition: '0 0, 20px 15px, 40px 30px, 0 0',
            backgroundSize: '40px 25px, 40px 25px, 40px 25px, 100% 100%',
            animation: 'starTwinkle 3s ease-in-out infinite',
          }}
        />

        {/* 우주 먼지 입자들 */}
        <div
          className='absolute'
          style={{
            top: '30%',
            right: '45%',
            width: '80px',
            height: '80px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 1px, transparent 1px),
              radial-gradient(circle, rgba(255, 217, 102, 0.2) 0.5px, transparent 0.5px),
              radial-gradient(circle, rgba(255, 217, 102, 0.1) 1.5px, transparent 1.5px)
            `,
            backgroundPosition: '0 0, 15px 10px, 30px 20px, 45px 30px',
            backgroundSize: '20px 20px',
            animation: 'dustParticles 8s ease-in-out infinite',
          }}
        />

        {/* 추가 행성들 */}
        <div
          className='absolute'
          style={{
            top: '60%',
            right: '40%',
            width: '70px',
            height: '70px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.4) 0%, rgba(255, 217, 102, 0.2) 70%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetFloat 8s ease-in-out infinite 2.5s',
          }}
        />

        {/* 더 많은 행성들 추가 */}
        <div
          className='absolute'
          style={{
            top: '70%',
            right: '30%',
            width: '45px',
            height: '45px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 0%, rgba(255, 217, 102, 0.25) 65%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetFloat 6s ease-in-out infinite 3.5s',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '80%',
            right: '45%',
            width: '35px',
            height: '35px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.6) 0%, rgba(255, 217, 102, 0.3) 60%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetFloat 7s ease-in-out infinite 4.5s',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '20%',
            left: '8%',
            width: '40px',
            height: '40px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 0%, rgba(255, 217, 102, 0.25) 65%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetFloat 7s ease-in-out infinite 4s',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '35%',
            left: '5%',
            width: '55px',
            height: '55px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.4) 0%, rgba(255, 217, 102, 0.2) 70%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'planetFloat 9s ease-in-out infinite 5s',
          }}
        />

        {/* 별똥별 효과들 */}
        <div
          className='absolute'
          style={{
            top: '15%',
            left: '60%',
            width: '3px',
            height: '80px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.9), rgba(255, 217, 102, 0.6), transparent)',
            transform: 'rotate(-45deg)',
            animation: 'shootingStar 4s ease-in-out infinite',
            filter: 'blur(0.5px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '25%',
            left: '70%',
            width: '2px',
            height: '60px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.8), rgba(255, 217, 102, 0.4), transparent)',
            transform: 'rotate(-30deg)',
            animation: 'shootingStar 5s ease-in-out infinite 1.5s',
            filter: 'blur(0.3px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '35%',
            left: '80%',
            width: '2.5px',
            height: '70px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.9), rgba(255, 217, 102, 0.5), transparent)',
            transform: 'rotate(-60deg)',
            animation: 'shootingStar 6s ease-in-out infinite 3s',
            filter: 'blur(0.4px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '45%',
            left: '20%',
            width: '2px',
            height: '50px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.7), rgba(255, 217, 102, 0.3), transparent)',
            transform: 'rotate(-25deg)',
            animation: 'shootingStar 3.5s ease-in-out infinite 2.5s',
            filter: 'blur(0.2px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '55%',
            left: '30%',
            width: '2.5px',
            height: '65px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.8), rgba(255, 217, 102, 0.4), transparent)',
            transform: 'rotate(-40deg)',
            animation: 'shootingStar 4.5s ease-in-out infinite 4s',
            filter: 'blur(0.3px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '65%',
            left: '15%',
            width: '2px',
            height: '55px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.6), rgba(255, 217, 102, 0.3), transparent)',
            transform: 'rotate(-35deg)',
            animation: 'shootingStar 3s ease-in-out infinite 5s',
            filter: 'blur(0.3px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '75%',
            left: '25%',
            width: '2.5px',
            height: '60px',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.7), rgba(255, 217, 102, 0.4), transparent)',
            transform: 'rotate(-50deg)',
            animation: 'shootingStar 4s ease-in-out infinite 6s',
            filter: 'blur(0.4px)',
          }}
        />

        {/* 더 많은 별자리 패턴들 */}
        <div
          className='absolute'
          style={{
            top: '10%',
            left: '40%',
            width: '80px',
            height: '80px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.6) 1.5px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 217, 102, 0.4) 1px, transparent 1px),
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 0.8px, transparent 0.8px)
            `,
            backgroundPosition: '0 0, 15px 10px, 30px 20px, 45px 30px',
            backgroundSize: '20px 20px',
            animation: 'constellationTwinkle 4s ease-in-out infinite 3s',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '50%',
            left: '10%',
            width: '90px',
            height: '90px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.7) 1.8px, transparent 1.8px),
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 1.2px, transparent 1.2px),
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 0.8px, transparent 0.8px)
            `,
            backgroundPosition: '0 0, 20px 15px, 40px 30px, 60px 45px',
            backgroundSize: '30px 30px',
            animation: 'constellationTwinkle 5s ease-in-out infinite 4s',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '30%',
            left: '80%',
            width: '70px',
            height: '70px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 1.2px, transparent 1.2px),
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 0.8px, transparent 0.8px)
            `,
            backgroundPosition: '0 0, 15px 10px, 30px 20px',
            backgroundSize: '25px 25px',
            animation: 'constellationTwinkle 6s ease-in-out infinite 5s',
          }}
        />

        {/* 더 많은 우주 먼지 구름들 */}
        <div
          className='absolute'
          style={{
            top: '15%',
            left: '30%',
            width: '100px',
            height: '60px',
            background: `
              radial-gradient(ellipse, rgba(255, 217, 102, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 60% 40%, rgba(255, 217, 102, 0.06) 0%, transparent 50%)
            `,
            borderRadius: '50%',
            animation: 'dustFloat 25s ease-in-out infinite 5s',
            filter: 'blur(2px)',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '40%',
            left: '70%',
            width: '80px',
            height: '50px',
            background: `
              radial-gradient(ellipse, rgba(255, 217, 102, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 40% 60%, rgba(255, 217, 102, 0.04) 0%, transparent 50%)
            `,
            borderRadius: '50%',
            animation: 'dustFloat 20s ease-in-out infinite 7s',
            filter: 'blur(1.5px)',
          }}
        />

        {/* 더 많은 우주 먼지 입자들 */}
        <div
          className='absolute'
          style={{
            top: '25%',
            left: '50%',
            width: '60px',
            height: '60px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.3) 1px, transparent 1px),
              radial-gradient(circle, rgba(255, 217, 102, 0.2) 0.5px, transparent 0.5px),
              radial-gradient(circle, rgba(255, 217, 102, 0.1) 1.5px, transparent 1.5px)
            `,
            backgroundPosition: '0 0, 10px 10px, 20px 20px, 30px 30px',
            backgroundSize: '15px 15px',
            animation: 'dustParticles 6s ease-in-out infinite 2s',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '60%',
            left: '20%',
            width: '50px',
            height: '50px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.2) 0.8px, transparent 0.8px),
              radial-gradient(circle, rgba(255, 217, 102, 0.15) 0.6px, transparent 0.6px),
              radial-gradient(circle, rgba(255, 217, 102, 0.1) 1px, transparent 1px)
            `,
            backgroundPosition: '0 0, 12px 8px, 24px 16px',
            backgroundSize: '18px 18px',
            animation: 'dustParticles 7s ease-in-out infinite 4s',
          }}
        />

        {/* 우주 배경 그라데이션 */}
        <div
          className='absolute'
          style={{
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at 20% 20%, rgba(255, 217, 102, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 217, 102, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(255, 217, 102, 0.02) 0%, transparent 70%)
            `,
            animation: 'spaceBackground 30s ease-in-out infinite',
          }}
        />

        {/* 추가 우주선들 */}
        <div
          className='absolute'
          style={{
            top: '45%',
            left: '20%',
            width: '60px',
            height: '35px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '18px',
              background: `
                linear-gradient(45deg, rgba(255, 217, 102, 0.7) 0%, rgba(255, 217, 102, 0.3) 100%)
              `,
              borderRadius: '9px',
              position: 'absolute',
              top: '8px',
              left: '10px',
              animation: 'spaceship 7s ease-in-out infinite 0.5s',
              boxShadow: '0 2px 6px rgba(255, 217, 102, 0.3)',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '6px',
              background: `
                linear-gradient(90deg, rgba(255, 217, 102, 0.8) 0%, rgba(255, 217, 102, 0.4) 100%)
              `,
              borderRadius: '3px',
              position: 'absolute',
              top: '14px',
              left: '2px',
              animation: 'engineFlame 0.6s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '5px',
              height: '5px',
              background: 'rgba(255, 217, 102, 1)',
              borderRadius: '50%',
              position: 'absolute',
              top: '15px',
              left: '32px',
              animation: 'spaceshipLight 1.5s ease-in-out infinite',
              boxShadow: '0 0 3px rgba(255, 217, 102, 0.8)',
            }}
          />
        </div>

        <div
          className='absolute'
          style={{
            top: '55%',
            left: '30%',
            width: '55px',
            height: '30px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '35px',
              height: '15px',
              background: `
                linear-gradient(45deg, rgba(255, 217, 102, 0.6) 0%, rgba(255, 217, 102, 0.3) 100%)
              `,
              borderRadius: '8px',
              position: 'absolute',
              top: '7px',
              left: '10px',
              animation: 'spaceship 5s ease-in-out infinite 1.5s',
              boxShadow: '0 2px 5px rgba(255, 217, 102, 0.3)',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '5px',
              background: `
                linear-gradient(90deg, rgba(255, 217, 102, 0.7) 0%, rgba(255, 217, 102, 0.3) 100%)
              `,
              borderRadius: '2.5px',
              position: 'absolute',
              top: '12px',
              left: '5px',
              animation: 'engineFlame 0.7s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '4px',
              height: '4px',
              background: 'rgba(255, 217, 102, 1)',
              borderRadius: '50%',
              position: 'absolute',
              top: '13px',
              left: '30px',
              animation: 'spaceshipLight 1.2s ease-in-out infinite',
              boxShadow: '0 0 2px rgba(255, 217, 102, 0.8)',
            }}
          />
        </div>

        {/* 작은 위성들 */}
        <div
          className='absolute'
          style={{
            top: '10%',
            left: '70%',
            width: '20px',
            height: '20px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.6) 0%, rgba(255, 217, 102, 0.3) 60%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'satelliteOrbit 12s linear infinite',
          }}
        />

        <div
          className='absolute'
          style={{
            top: '85%',
            left: '60%',
            width: '15px',
            height: '15px',
            background: `
              radial-gradient(circle, rgba(255, 217, 102, 0.5) 0%, rgba(255, 217, 102, 0.25) 60%, transparent 100%)
            `,
            borderRadius: '50%',
            animation: 'satelliteOrbit 15s linear infinite reverse',
          }}
        />

        {/* 모바일 전용 하단부 장식 요소들 */}
        <div className='sm:hidden'>
          {/* 모바일 하단 별자리 패턴 */}
          <div
            className='absolute'
            style={{
              bottom: '15%',
              left: '10%',
              width: '80px',
              height: '80px',
              background: `
                radial-gradient(circle, rgba(255, 217, 102, 0.7) 1.5px, transparent 1.5px),
                radial-gradient(circle, rgba(255, 217, 102, 0.5) 1px, transparent 1px),
                radial-gradient(circle, rgba(255, 217, 102, 0.3) 0.8px, transparent 0.8px)
              `,
              backgroundPosition: '0 0, 15px 10px, 30px 20px',
              backgroundSize: '25px 25px',
              animation: 'constellationTwinkle 5s ease-in-out infinite 2s',
            }}
          />

          {/* 모바일 하단 작은 행성 */}
          <div
            className='absolute'
            style={{
              bottom: '25%',
              right: '15%',
              width: '50px',
              height: '50px',
              background: `
                radial-gradient(circle, rgba(255, 217, 102, 0.5) 0%, rgba(255, 217, 102, 0.25) 65%, transparent 100%)
              `,
              borderRadius: '50%',
              animation: 'planetFloat 7s ease-in-out infinite 3s',
            }}
          />

          {/* 모바일 하단 우주선 */}
          <div
            className='absolute'
            style={{
              bottom: '10%',
              right: '25%',
              width: '45px',
              height: '25px',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '12px',
                background: `
                  linear-gradient(45deg, rgba(255, 217, 102, 0.7) 0%, rgba(255, 217, 102, 0.3) 100%)
                `,
                borderRadius: '6px',
                position: 'absolute',
                top: '6px',
                left: '8px',
                animation: 'spaceship 6s ease-in-out infinite 1s',
                boxShadow: '0 1px 4px rgba(255, 217, 102, 0.3)',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '4px',
                background: `
                  linear-gradient(90deg, rgba(255, 217, 102, 0.8) 0%, rgba(255, 217, 102, 0.4) 100%)
                `,
                borderRadius: '2px',
                position: 'absolute',
                top: '10px',
                left: '2px',
                animation: 'engineFlame 0.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '3px',
                height: '3px',
                background: 'rgba(255, 217, 102, 1)',
                borderRadius: '50%',
                position: 'absolute',
                top: '11px',
                left: '23px',
                animation: 'spaceshipLight 1.8s ease-in-out infinite',
                boxShadow: '0 0 2px rgba(255, 217, 102, 0.8)',
              }}
            />
          </div>

          {/* 모바일 하단 별똥별 */}
          <div
            className='absolute'
            style={{
              bottom: '20%',
              left: '40%',
              width: '2px',
              height: '40px',
              background: 'linear-gradient(to bottom, transparent, rgba(255, 217, 102, 0.8), rgba(255, 217, 102, 0.4), transparent)',
              transform: 'rotate(-35deg)',
              animation: 'shootingStar 4s ease-in-out infinite 2s',
              filter: 'blur(0.3px)',
            }}
          />

          {/* 모바일 하단 우주 먼지 */}
          <div
            className='absolute'
            style={{
              bottom: '8%',
              left: '20%',
              width: '60px',
              height: '40px',
              background: `
                radial-gradient(ellipse, rgba(255, 217, 102, 0.08) 0%, transparent 60%),
                radial-gradient(ellipse at 60% 40%, rgba(255, 217, 102, 0.06) 0%, transparent 50%)
              `,
              borderRadius: '50%',
              animation: 'dustFloat 15s ease-in-out infinite 4s',
              filter: 'blur(1.5px)',
            }}
          />

          {/* 모바일 하단 추가 행성 */}
          <div
            className='absolute'
            style={{
              bottom: '5%',
              right: '8%',
              width: '35px',
              height: '35px',
              background: `
                radial-gradient(circle, rgba(255, 217, 102, 0.4) 0%, rgba(255, 217, 102, 0.2) 70%, transparent 100%)
              `,
              borderRadius: '50%',
              animation: 'planetFloat 8s ease-in-out infinite 4s',
            }}
          />
        </div>

        {/* 황금외계인 등장 시 플래시 이펙트 */}
        {fallingAliens.some(alien => alien.isGolden) && (
          <div
            className='fixed inset-0 pointer-events-none'
            style={{
              background: 'radial-gradient(circle, rgba(255, 217, 102, 0.3) 0%, rgba(255, 217, 102, 0.1) 40%, transparent 70%)',
              animation: 'goldenFlash 2s ease-out',
              zIndex: 999,
            }}
          />
        )}

        {/* 황금외계인 파티클 이펙트 */}
        {goldenParticles.map((particle) => (
          <div
            key={particle.id}
            className='absolute pointer-events-none'
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: '20px', // 12px에서 20px로 증가
              height: '20px',
              background: 'radial-gradient(circle, rgba(255, 217, 102, 1) 0%, rgba(255, 204, 2, 0.9) 30%, rgba(255, 217, 102, 0.7) 60%, transparent 100%)',
              borderRadius: '50%',
              animation: `goldenParticle${particle.animationType} 2s ease-out forwards`, // 1.5s에서 2s로 증가
              animationDelay: `${particle.animationDelay}s`,
              zIndex: 1001,
              filter: 'blur(0.3px)', // 블러 감소로 더 선명하게
              boxShadow: '0 0 15px rgba(255, 217, 102, 1), 0 0 25px rgba(255, 204, 2, 0.6)', // 더 강한 글로우
            }}
          >
            {/* 내부 코어 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 217, 102, 1)',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(255, 217, 102, 1)',
              }}
            />
          </div>
        ))}

        {/* 떨어지는 외계인들 */}
        {fallingAliens.map((alien) => (
          <div
            key={alien.id}
            className='absolute pointer-events-none'
            style={{
              left: `${alien.x}px`,
              top: `${alien.y}px`,
              transform: `rotate(${alien.rotation}deg) scale(${alien.scale})`,
              animation: alien.isGolden 
                ? 'goldenAlienFall 7s ease-in-out forwards' 
                : 'alienFall 5s ease-in-out forwards',
              zIndex: 1000,
            }}
          >
            <img
              src={alien.image}
              alt="Falling Alien"
              style={{
                width: alien.isGolden ? '100px' : '80px', // 황금외계인은 더 큰 크기
                height: alien.isGolden ? '100px' : '80px',
                objectFit: 'contain',
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default SpaceBackground;