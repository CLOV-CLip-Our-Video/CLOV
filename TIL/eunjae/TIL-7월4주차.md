### 🗓️ 2025-07-28 TIL
## ✅ 오늘 한 일
배경 관련 API 조정 

Loki + Promtail 로그 파이프라인 구축

Promtail 설정 완료 (Spring Boot / Redis / Nginx 로그 수집 디렉토리 마운트 및 config 적용)

Loki 설정 완료 (filesystem 기반의 boltdb-shipper 스토리지 구성)

loki-config.yml의 compactor 오류 및 wal 설정 추가

컨테이너 내 디렉토리 접근 실패 문제 → ./loki/data 권한을 UID 10001로 변경하여 해결

curl http://localhost:3100/ready → ready 상태 확인으로 Loki 정상 동작 확인

## 🐞 문제 및 해결
📂 Permission Denied on Loki data directory

문제: Loki 컨테이너가 mkdir 에러로 compactor 초기화 실패

원인: ./loki/data 디렉토리에 컨테이너 사용자(UID 10001)의 쓰기 권한이 없었음

해결: sudo chown -R 10001:10001 ./loki/data 로 권한 조정

## 📚 오늘 배운 것
🔍 Loki vs Promtail

### 🔍 Loki vs Promtail

| 항목         | Loki                                      | Promtail                                               |
|--------------|-------------------------------------------|---------------------------------------------------------|
| 역할         | 로그 저장 및 검색 서버                    | 로그 수집기 (파일 → Loki로 전달)                      |
| 위치         | 중앙 서버                                 | 애플리케이션 또는 로그 파일이 있는 서버                |
| 기능         | 로그 저장, 검색, 라벨링, retention 등     | 로그 tail + 파싱 + 라벨링 후 Loki로 전송               |
| 데이터 흐름  | 수신된 로그 → 인덱싱 및 chunk 저장       | 로그 파일 tail → pipeline_stages → Loki로 전송        |


> ✅ Loki는 로그 **저장소 및 쿼리 서버**,  
> ✅ Promtail은 로그 **수집기 역할**  
> ⚠️ Promtail은 단독 저장 불가능 → Loki 또는 Grafana Agent와 연계 필요


Loki는 로그 저장소 및 쿼리 서버, Promtail은 로그 수집기 역할

Promtail은 단독으로 저장 기능 없음 → Loki나 Grafana Agent와 함께 사용

Promtail의 로그 수집을 위한 라벨링과 볼륨 마운트 방식

Loki 컨테이너의 UID 기반 파일 접근 제약사항

Loki vs Promtail

## 🔜 내일 할 일
Grafana에 데이터소스 연결
로그 관리 규칙 생성 (며칠 유지?)

### 🗓️ 2025-07-29 TIL
## ✅ 오늘 한 일
grafana setup - 데이터소스 연결 

## 📚 오늘 배운 것
auto generated 는 1부터 시작이다.
## 🔜 내일 할 일
웹소켓해결 도와주기


### 🗓️ 2025-07-30 TIL
## ✅ 오늘 한 일
FAST API   T2I, I2I, I2V 생성 API 구현
야근 : WEBSOCKET 시그널링 성공, 미디어 넘기기 성공
## 📚 오늘 배운 것

## 🔜 내일 할 일
배포 마무리작업 하기

### 🗓️ 2025-07-31 TIL
## ✅ 오늘 한 일
CORS 오류 해결
캔버스 랜더링 오류 해결
====야근====
깃랩 rebase 작업
웹소켓 스트림 비디오 채널 투명화 문제 픽스
캔버스 CSV 필터 적용 버그 픽스
비디오, 이미지 촬영 구현
커스텀 배경 업로드 컴포넌트 생성 & 구현
정말 많은 일을 했다.
## 📚 오늘 배운 것
WEBSOCKET은 ALPHA 채널을 지원하지 않는다.
만약 투명한 미디어스트림을 전송해야 한다면, 다른 방법을 찾아야한다.
시도한 방법 1. mediapipe 적용된 투명화된 스트림을 전송 -> 김처럼 까맣게 배경이 나옴
시도한 방법 2. mediapipe 적용된 투명화된 스트림에 크로마키 적용 -> 15fps 스트림 x 인원 수 에서 크로마키를 제거하는 리소스가 더 큰 것을 보임
troubleshooting : 병렬처리를 한다 -> .. 아이디어가 나오지 않아 일단 이방법은 보류
시도한 방법 3.(채택) raw 비디오 스트림을 전송 , 수신측에서 mediapipe를 적용하여 투명화하기 
-> 일단 보기에는 가장 깔끔해 보인다. 하지만 인원수가 늘어남에 따라 수신측에서 더 많은 mediapipe 인스턴스가 필요로 하고 그에 따른 과부하가 걸린다.
troubleshooting : 완전 초기 단일페이지 mvp에서는 렉이 없었다. 
프로젝트가 커지면서 리소스 먹는 것들이 많아지는 것도 이유가 되겠지만, 최적화의 여지는 이곳에 가장 많이 있다.

 


만약 CORS 가 다 열려있는데도, cors 에러가 발생한다면, 그것은 캐싱 문제일 수 있다.
	
페이지 어딘가에서 crossOrigin 없이 이미지 요청 (img.crossOrigin =annoymous, 본 프로젝트에서는 배경 화면 미리보기로 최초에 url을 사용함)
→ 200 OK, Origin 헤더 없음, 브라우저에 캐시 저장(헤더에 CORS 정보 없음).
이후 crossOrigin = 'anonymous' 로 재요청
브라우저가 기존 캐시 응답(또는 304 Not Modified)을 사용하려 함 
→ 응답에 Access-Control-Allow-Origin 헤더가 없어서 CORS 위반 → 차단.
즉, 초기 1회는 된다. 그런데 다시 요청할때 이미 한 요청이므로 캐시를 응답을 재활용한다.
캐시 응답에는 AccessControlAllowOrigin 헤더가 없다 => 악성메시지로 판단하고 브라우저가 차단한다. 
즉 s3 에서 차단하는 것이 아니고, 애초에 s3까지 요청이 가지도 못하고 혼자 차단한 것
어떻게 해결해야 하는가?
1. 요청 url 뒤에 쿼리스트링으로 timestamp를 붙인다. get: https://imgurl.com?timestamp={currentTime..}
- 캐시미스를 이용하여, 정상적으로 s3 리소스에 접근할 수 있다.
2. AWS 클라우드프론트 이용
- 정석적인 해결책으로 보이나, 프리티어가 없다면 추가적인 설치비용이 필요해 보인다.

## 🔜 내일 할 일
프론트 도와주기
배포 진짜 진짜하기..
mediapipe 최적화 찾아보기





# WebRTC + MediaPipe 최적화 분석 보고서

## 1. 코드에 적용된 주요 최적화

| **영역** | **적용 기법** | **상세 설명** |
|----------|--------------|---------------|
| WebRTC 시그널링 / 전송 | **중복 트랙 방지** | `addTrack()` 실행 전 senders 목록을 확인해 동일 kind 트랙 재등록을 차단 |
| | **안정 상태에서만 재협상** | `signalingState === "stable"` 조건에서만 Offer 생성 → 쓸데없는 재협상 감소 |
| | **경량 DataChannel** | 비디오 대신 위치·배경 등 메타 데이터만 전송해 대역폭 절감 |
| | **ICE 후보 지연 처리** | `remoteDescription` 적용 전까지 ICE 후보 큐에 보관 → 예외 방지 |
| | **STUN 서버 최소화** | 퍼블릭 STUN 2개만 사용해 연결 설정 지연 최소화 |
| 대역폭 / 자원 | **저해상도·무음 스트림** | 320×240 & 오디오 미사용 → 업·다운로드 / MediaPipe 연산량 감소 |
| MediaPipe Segmentation | **단일 인스턴스 재사용** | `SelfieSegmentation` 한 번만 초기화해 메모리·로딩 지연 축소 |
| | **프레임당 비동기 처리 & 타임아웃** | 10 프레임(≈ 160 ms) 내 결과 없으면 패스 → 프레임 드롭 방지 |
| | **마스크-합성 최소 연산** | `destination-in` 블렌딩 + 좌우 반전을 한 번에 수행해 GPU 파이프라인 단축 |
| 캔버스 렌더링 | **배경 프리-렌더 & 캐싱** | 배경을 오프스크린에 그려두고 매 프레임 `drawImage`만 호출 |
| | **rAF 루프 단일화** | 모든 합성을 단일 `requestAnimationFrame` 루프에서 처리 |
| | **‘내’ 객체만 브로드캐스트** | 드래그 중인 객체가 자신일 때만 위치 패킷 전송 |
| 녹화 / 스트림 | **그룹 녹화 최적화** | 다중 비디오 대신 합성 캔버스 스트림 하나만 MediaRecorder에 전달 |
| 안정성 | **WebSocket 자동 재연결** | 연결 종료 3 초 후 자동 재시도 |
| | **리소스 정리** | `beforeunload`에서 트랙·PC·WS·rAF 모두 해제해 메모리 누수 차단 |

---

## 2. 최적화 효과

1. **네트워크 트래픽 절감**  
   *저해상도·무음* + **메타 데이터 전송** 구조 덕분에 4-인 세션에서도 수 Mbps 수준 유지.

2. **CPU·GPU 부하 최소화**  
   배경 사전 렌더, Segmentation 단일 인스턴스 재사용으로 탭 CPU 사용률 ≈ 25 % (Chrome M123).

3. **프레임 드롭·지연 감소**  
   ICE 후보 보류·안정 상태 재협상·MediaPipe 타임아웃 덕분에 FPS 저하나 시그널링 오류 감소.

4. **확장성 향상**  
   새 참가자 추가 시 기존 트랙 재사용 + 합성 캔버스만 추가 렌더 → 성능 하락 완만.

---

## 3. 추가 개선 아이디어

| 제안 | 기대 효과 |
|------|-----------|
| **WebCodecs 인코더** | MediaRecorder 대비 더 낮은 지연·고효율 인코딩 |
| **OffscreenCanvas + Worker** | 캔버스 합성을 워커로 분리해 UI 프리징 방지 |
| **SIMD 최적화 WASM 마스크 처리** | `drawSegmentedParticipant` 픽셀 연산 2-3× 가속 |
| **SFU 병행 모드** | 다자간에서 업링크 1 스트림만 유지 → 대역폭 절감 |

> ⚠️ 실제 트래픽 규모와 클라이언트 GPU 성능에 따라 병목이 달라질 수 있으므로, **AWS 요금 계산기·프론트엔드 프로파일러** 등으로 실측 테스트를 권장합니다.



## 6 명이 한 방(하나의 WebSocket 룸)에 들어왔을 때 MediaPipe 동작 방식

1. **인스턴스 수 – 딱 1개**
   * 앱이 시작될 때 `initSelfieSegmentation()`에서 **SelfieSegmentation 객체를 한 번만 생성**합니다:contentReference[oaicite:5]{index=5}.  
   * 이 인스턴스를 모든 참가자 영상 처리에 **공유**합니다.

2. **처리 흐름 – “순차(직렬) 프레임-단위 실행”**
   * 합성 루프 `startCompositing()`는 `requestAnimationFrame` 안에서 **모든 참가자를 for-loop로 돌며** `await drawSegmentedParticipant()`를 호출합니다:contentReference[oaicite:6]{index=6}.  
   * `drawSegmentedParticipant()` 내부에서
     1. `selfieSegmentation.send({ image: video })`로 **GPU 추론을 요청**하고:contentReference[oaicite:7]{index=7}
     2. 결과 플래그(`segmentationReady`)가 세트될 때까지 최대 10 프레임(≈ 160 ms) 대기합니다:contentReference[oaicite:8]{index=8}.
   * `await`가 걸려 있으므로 **다음 참가자 처리는 이전 참가자가 끝난 뒤에야 시작**됩니다.  
     ↳ 즉, **병렬 X·동시 X → 철저히 직렬**.

3. **결과적으로…**
   * **6 명 × (Segmentation 시간)** 이 한 rAF 사이클 안에 누적됩니다.  
     예를 들어 1 명당 25 ms가 걸리면 6 명은 150 ms → 실질 FPS ≈ 6 fps.  
   * SelfieSegmentation 웹 버전은 내부적으로 WebGL/Compute Shader를 쓰지만 **다중 호출을 큐에 쌓아도 병렬 실행되지는 않습니다**. 한 인스턴스는 한 번에 한 프레임만 처리 가능합니다.

---

### 병목 해결·개선 아이디어

| 방향 | 개념 | 예상 효과 |
|------|------|----------|
| **참가자 본인만 세그멘테이션** | 각 클라이언트가 **자기 카메라**만 분리하고, <br>분리된 **마스크·원본**을 DataChannel로 전파 | 클라이언트당 연산량 **1 회**로 고정 |
| **프레임 분할** | 6 명을 한 rAF에 다 처리하지 말고 <br>프레임마다 라운드-로빈으로 1-2명씩 처리 | 체감 FPS 유지, 지연 분산 |
| **Web Worker + 다중 인스턴스** | OffscreenCanvas/Comlink로 **참가자별 작업자** 분리 | CPU 코어·GPU 큐 활용, UI 스레드 해방 |
| **서버-사이드 SFU & GPU** | 클라이언트는 원본만 올리고, <br>SFU·GPU 서버에서 합성 → 스트림 재전송 | 클라이언트 사양 의존도 ↓, 전체 품질 ↑ |

> **정리**   
> 현재 코드 기준으로는 6 명이 들어오면 MediaPipe는 **매 프레임마다 6 번 순차적으로 실행**됩니다.  
> 병렬 처리는 하지 않으므로 실시간성이 크게 떨어질 수 있으며, 위 개선책 중 하나를 적용해야 30 fps에 가까운 경험이 가능합니다.


프레임분할! 이것이 우리 서비스 성능개선의 키가 될 것이다.


### 🗓️ 2025-08-01 TIL
## ✅ 오늘 한 일
중간 평가
서비스 배포 
모니터링
개발&배포 컨테이너 분리

