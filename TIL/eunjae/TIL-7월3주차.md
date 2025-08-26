# 📝 Today I Learned - 2025.07.21

---

## ✅ 오늘 할 일
- Presigned URL 요청 API 설계
- EC2 인프라 셋팅, MYSQL

---

## 📘 오늘 배운 것

- **Presigned URL**은 S3에 직접 업로드할 수 있도록 하는 안전한 방식이지만, 인증 로직이 없는 경우 남용 위험이 있음
- 사용자 인증이 없는 시스템에서는 Presigned URL 발급 시에도 다음을 고려해야 함:
  - ✅ **RoomCode의 존재 여부 확인** (`RedisTemplate.hasKey(roomCode)`)
  - ✅ **요청 횟수 제한** (`increment + TTL` 기반 Redis rate limiting)
- Redis의 `hasKey()` + `increment()` + `expire()` 조합으로 간결한 요청 제한 로직 구현 가능
- Spring의 커스텀 예외 처리:
  - `TooManyRequestsException`, `InvalidRoomException` 등 정의
  - `@ResponseStatus`로 상태 코드 명시 가능
- `ErrorCode` enum을 활용하여 에러 응답 메시지를 일관되게 처리

---

## 🛠️ 오늘 구현한 것

- `/api/v1/backgrounds/rooms/{roomCode}/canvas/background` Presigned URL 발급 API에 다음 검증 로직 추가:
  - ❌ 존재하지 않는 RoomCode: 400 Bad Request
  - ⛔ 1분당 10회 초과 시: 429 Too Many Requests
- Redis 키 구조:
  - `roomCode`: 방 유효성 확인용 (`30분 TTL`)
  - `rate:presign:{roomCode}`: 발급 요청 제한 키 (`1분 TTL`)
- `ErrorCode` enum에 항목 추가:
  - `TOO_MANY_REQUESTS(429, ..., "요청 횟수를 초과하였습니다.")`
  - `INVALID_ROOM(400, ..., "존재하지 않거나 만료된 방입니다.")`

---

## 📅 내일 할 일

- EC2 Settings

---
# 📝 Today I Learned - 2025.07.22

## ✅ 오늘 한 일
EC2에 직접 Redis를 Docker로 설치 및 실행 (--requirepass, --appendonly yes 설정 포함)

Spring Boot 앱을 Gradle로 빌드 후 .jar 파일 생성 및 EC2로 전송

Dockerfile 작성 및 Spring Boot 컨테이너 빌드 (openjdk 17, java -jar)

docker-compose.yml을 구성하여 SpringBoot, Redis, Nginx 세 컨테이너 통합

SpringBoot 앱 정상 실행 및 Redis 연동 검증

Nginx 설정 (default.conf) 작성하여 프록시 서버 구성

/api/** 경로를 clov-app:8080/api/로 프록시하여 외부 접근 가능하도록 수정

외부 브라우저 및 Postman에서 실제 API 응답 확인 성공

# ⚙️ 사용한 기술 스택 및 도구
AWS EC2 (Ubuntu)

Docker / Docker Compose

Spring Boot 3.x (Gradle, Java 17)

Redis 7 (도커 기반 설치)

Nginx (프록시 서버)

curl, scp, systemd, CLI 기반 배포

## 💡 배운 점
EC2 인스턴스 내부에서는 169.254.169.254 메타데이터 주소를 통해 VPC, Subnet, 보안그룹 정보를 조회할 수 있다.

Docker Compose의 서비스 이름은 컨테이너 간 DNS 호스트 역할을 한다 (clov-app:8080).

proxy_pass 경로 뒤 슬래시(/) 유무가 프록시 대상 경로 결정 방식에 영향을 미치므로 매우 중요하다.

SpringBoot에서 /api/** 경로를 프록시할 때 Nginx 경로 설계와 컨트롤러 매핑 경로가 일치해야 정상 작동한다.

**/api/가 없어지지 않도록 조심하자.**

단일 컨테이너 실행과 docker-compose 방식에서 컨테이너 네이밍, 재시작 정책 등 차이점에 주의해야 한다.

## 🧩 내일 할 일 (예정)

Jenkins 설치 및 GitLab 연동 → 무중단 CI/CD 구축

Nginx HTTPS 인증서 적용 (Let's Encrypt, certbot)

프론트엔드 앱 정적 배포 (Vue/Nuxt 등)

Nginx 정적 + API 프록시 통합 구조 구성


🗓️ 2025-07-22 TIL  
✅ 오늘 한 일  
Spring Boot 백엔드 JAR 빌드 및 Docker 이미지 생성  
Redis 컨테이너 구성: 비밀번호 설정 및 health check 포함한 docker-compose.yml 작성  
Nginx + Let's Encrypt 인증서 발급 및 HTTPS 리디렉션 설정 완료  
React 프론트엔드 빌드 후 Docker 컨테이너로 배포  
GitLab + Jenkins CI/CD 연동 준비  
GitLab push 시 프론트/백 빌드 자동화하는 Jenkinsfile 설계  
Jenkins에서 실행된 빌드 결과를 /home/ubuntu/clov 아래로 복사해 실제 배포 경로에 반영  
서버 HTTPS 배포 성공 (https://clov.co.kr)  

🐞 겪은 이슈 & 해결  
certbot 인증 오류 → 방화벽(UFW) 80/443 포트 허용 후 해결  
nginx 컨테이너 포트 충돌 → 기존 OS nginx 서비스 종료 후 컨테이너 사용  
Jenkins 컨테이너 초기화 → 볼륨 미지정으로 인해 설정 초기화됨  

📝 내일 할 일  
Jenkins 재설치 및 Docker 볼륨으로 지속적 데이터 유지 설정  
GitLab Webhook 연동 및 CI/CD 자동화 완료  
프론트엔드 배포 시 환경변수 적용 방식 설계  
HTTPS 리버스 프록시 경유 구조에서 정적 자산 접근 이슈 점검  

---

🗓️ 2025-07-23 TIL  
✅ 오늘 한 일  
- frontend , backend build 및 ssh를 통한 ec2 서버 전송
- 도메인 구매 및 셋팅, 연동 확인-> root에서 frontend 정적파일 서빙 확인
- `docker compose` 기반 컴포넌트간 연동 
- Jenkins와 Docker Compose 연동을 통해 GitLab 푸시 트리거 기반 CI/CD 파이프라인 완성  
- 프론트/백 Dockerfile 정상 작동 확인 및 이미지 재생성 성공  
- GitLab에서 Push 후, 자동으로 배포까지 이어지는 전체 흐름 확인 
- GitLab Webhook 정상 연동 여부 확인


🐞 겪은 이슈 & 해결  
- `docker-compose down` 실행 시 Jenkins도 종료되어 파이프라인 강제 중단됨  
→ `docker-compose rm -sf`로 서비스 컨테이너만 제거하도록 수정  
- EBADENGINE 경고: 현재 Node.js 18.x 사용 중, Vite/React-router 7은 Node.js 20 이상 요구  
→ 추후 Jenkins Node 환경 업그레이드 필요  

📝 내일 할 일  
- AI 활용 기획 
- 프론트엔드 팀 지원
- 인프라 모니터링 ? 다중 인스턴스 고려

# 🗓️ 2025-07-24 TIL

✅ 오늘 한 일
- 프론트 지원 : **MediaPipe** 기반 영상 처리에 대해 학습하고, 간단한 실습을 진행함  
  → 실시간 분할 및 전경-배경 처리 흐름 이해
- **Room / Participants 테이블의 PK 인덱싱 구조 개선 작업**  
  → 기존 UUID 기반 PK 외에 B+Tree 성능 향상을 위해 **정수형 서브 키 컬럼**을 별도로 추가
- **Jenkins Webhook 403 오류 해결**  
  → 원인은 GitLab Webhook의 Secret Token 삭제 및 Webhook 경로의 HTTP/HTTPS 불일치  
  → Jenkins System URL 수정 + Secret Token 재설정으로 해결 완료

📚 오늘 배운 것
- Webhook 인증 실패 시 Jenkins는 요청을 `anonymous`로 간주하며, 권한 부족 시 403 에러 발생
- GitLab과 Jenkins 연동 시, **Job 설정에서 GitLab Connection을 반드시 명시해야** 인증 처리가 정상적으로 이뤄짐
- MediaPipe의 `SelfieSegmentation` 모델을 활용하면 WebRTC 또는 Canvas 기반 카메라 영상에 전경 분리 및 배경 처리 구현 가능
- Webhook 연결시 Secret Key를 잘 설정해둬야 한다.
- DB는 데이터 저장에 B+Tree 를 사용한다. Index가 String uuid 인 경우, 순서대로 삽입이 되지 않아, insert가 자주 발생하는 경우 데이터가 밀려나며 삽입 성능이 크게 떨어진다. 따라서 uuid를 식별자로 사용하더라도 정수형 pk를 두는 것이 좋습니다. 
📝 내일 할 일  
- AI 활용 기획 
- 프론트엔드 팀 지원
- 모니터링 툴, swagger작업 ,fast API?란 

# 🗓️ 2025-07-25 TIL
✅ 오늘 한 일
- cors 설정, 단, 개발용으로 현재 전체 공개 중
- RDB 테이블 초기화 -> 변화된 entity 적용
- Redis 연동 오류 fix
- jenkins timezone 설정

📚 오늘 배운 것
포트 는 잘 닫고 다녀야한다.
랜섬웨어 당할수도있다. 

gitlab에는 application.yml 파일이 없다.
그래서 webhook -build 사이클에서는 포함되지 않아서 따로 보내줘야한다.

근데 보내줘도 application.yml을 캐싱하고있는것인지, 변경사항을 넣지 못한다.
그래서 docker-compose 단계에서 application container에 환경변수로 redis setting을 넣어놨다.
web 단계에 공개되는 정보는 없으니 보안상 손해는 없을 것으로 보인다..

📝 내일 할 일
- APM 툴 서치 및 선정..