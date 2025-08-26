/* eslint-disable */
import { useState } from 'react';
import { ALIEN_IMAGES, GOLDEN_ALIEN_IMAGE, GOLDEN_ALIEN_CHANCE } from '../constants';

export const useFallingAliens = () => {
  const [fallingAliens, setFallingAliens] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [goldenParticles, setGoldenParticles] = useState([]);

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 800); // 0.8초 동안 흔들림
  };

  const createGoldenParticles = (x, y) => {
    const particles = [];
    for (let i = 0; i < 8; i++) { // 6개에서 8개로 증가
      particles.push({
        id: Date.now() + i,
        x: x + Math.random() * 120 - 60, // 더 넓은 범위로 분산
        y: y + Math.random() * 60 - 30,
        animationDelay: Math.random() * 0.8, // 더 다양한 지연시간
        animationType: Math.floor(Math.random() * 4) + 1,
      });
    }
    setGoldenParticles(particles);
    
    // 파티클 제거 시간 증가
    setTimeout(() => {
      setGoldenParticles([]);
    }, 2000);
  };

  const dropAlien = (forceGolden = false) => {
    let selectedImage;
    let isGolden = false;
    
    if (forceGolden) {
      // 디버깅용: 강제로 황금 외계인 등장
      selectedImage = GOLDEN_ALIEN_IMAGE;
      isGolden = true;
    } else {
      // 일반 로직: 1/1000 확률로 황금 외계인 등장
      isGolden = Math.random() < GOLDEN_ALIEN_CHANCE;
      selectedImage = isGolden ? GOLDEN_ALIEN_IMAGE : ALIEN_IMAGES[Math.floor(Math.random() * ALIEN_IMAGES.length)];
    }

    const randomX = Math.random() * (window.innerWidth - 120);
    
    const newAlien = {
      id: Date.now(),
      image: selectedImage,
      x: randomX,
      y: -100,
      rotation: Math.random() * 360,
      scale: isGolden ? 1.0 + Math.random() * 0.3 : 0.8 + Math.random() * 0.4, // 황금외계인은 더 큼
      isGolden: isGolden,
    };

    setFallingAliens((prev) => [...prev, newAlien]);

    // 황금외계인인 경우 특별 이펙트 실행
    if (isGolden) {
      triggerScreenShake();
      createGoldenParticles(randomX + 40, 50); // 외계인 위치 근처에서 파티클 생성
    }

    // 황금외계인은 7초, 일반외계인은 5초 후 제거 (황금외계인이 더 천천히 떨어짐)
    const fallDuration = isGolden ? 7000 : 5000;
    
    setTimeout(() => {
      setFallingAliens((prev) =>
        prev.filter((alien) => alien.id !== newAlien.id)
      );
    }, fallDuration);
  };

  return { 
    fallingAliens, 
    dropAlien, 
    screenShake, 
    goldenParticles 
  };
};
