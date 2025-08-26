/* eslint-disable */
import Filter from 'badwords-ko';

const profaneFilter = new Filter();
const additionalWords = [
  '씹새', '니미', '자지', '보지', '남창', '뻐킹', '우라질',
  '쒸벌럼', '쒸발', '씻팔', '십새키', '쓉벌', '쓉뻘', '피웅신',
  '비웅신', '피융신', '비융신', '퓽신', '븅신', '삐웅신', '빙신',
  '씨밸', '씨벨', '쓉얼', '쒸벌', '씨벌', '슈벌', '쓔벌', '쓔발'
];

// 기본 패키지에 없는 비속어 추가
profaneFilter.addWords(...additionalWords);

export default profaneFilter;
