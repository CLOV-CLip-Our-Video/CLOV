# 📅 TIL - YYYY-MM-DD

## 📌 오늘 한 일
1. 프로젝트 진행: (예: 로그인 페이지 개발, API 연동 테스트 등)
2. 학습 내용: (예: JS 비동기 처리, Phaser.js 튜토리얼 등)
3. 기타: (예: 팀 회의, 문서 정리 등)

---

## 📖 오늘 새롭게 배운 내용
> 핵심 개념 정리, 코드 예시 포함

### 🔹 개념 요약
- 예: `Promise`는 비동기 작업의 완료를 나타내는 객체이다.
- 예: `Game Loop`는 매 프레임마다 게임 상태를 업데이트하고 렌더링하는 구조다.

### 🔹 코드 예시
```js
// 예시: JS에서 Promise 사용하기
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('data loaded!'), 1000);
  });
}
```

- Git에 올릴 땐 간단한 커밋 메시지:
```bash
git add TIL
git commit -m "docs : TIL 2025-07-14"
git push