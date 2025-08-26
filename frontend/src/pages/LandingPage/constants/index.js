import alienHello from '../../../assets/images/characters/alien_hello.png';
import alienComputer from '../../../assets/images/characters/alien_computer.png';
import alienClick from '../../../assets/images/characters/alien_click.png';
import alienSelfie from '../../../assets/images/characters/alien_selfie.png';
import alienGolden from '../../../assets/images/characters/alien_golden.png';

// 일반 외계인 이미지들
export const ALIEN_IMAGES = [
  alienHello,
  alienComputer,
  alienClick,
  alienSelfie,
];

// 황금 외계인 이미지
export const GOLDEN_ALIEN_IMAGE = alienGolden;

// 황금 외계인 등장 확률 (1/1000 = 0.001)
export const GOLDEN_ALIEN_CHANCE = 0.001;

// 황금 외계인 등장 디버깅용 키 조합
export const DEBUG_KEYS = {
  GOLDEN_ALIEN: 'shift+space',
};
