# 📘 TIL: Today I Learned

---

## 📅 날짜
`2025-07-14`

---

## 📝 주제
- 서비스 기획과 프로젝트 방향성

---

## 🎯 학습 목표
- 서비스 기획 구체화 : 서비스 플로우 차트 제작
- 팀 컨벤션 설정
- MVP 설계
---

## 🔍 핵심 내용
1. **서비스 플로우 차트**  
```
1. 웹 접속
2. 방 생성 여부 판단
   ├─ 예 (호스트)
   │   1) 방 생성(방장)
   │   2) 초대하기
   │   3) 배경 설정
   │   4) 카메라 설정
   │   5) 영상/사진 촬영
   └─ 아니오 (참여자)
       1) 방 참가
          - 방 코드 입력 또는 QR 스캔
       2) 방(코드) 존재 여부 판단
          ├─ 예
          │   a) 방 입장
          │   b) 카메라 설정
          │   c) 영상/사진 촬영
          └─ 아니오
              ‣ “존재하지 않는 방입니다.” 출력
              ‣ 시작(웹 접속)으로 돌아감
3. 저장 & 공유하기
4. 카메라 중지
5. 종료
```
2. **커밋 컨벤션**
- chore : 동작에 영향 없는 코드 or 변경 없는 변경사항(주석 추가 등) or 파일명, 폴더명 수정 or 파일, 폴더 삭제 or 디렉토리 구조 변경
- rename : 파일 이름 변경시
- feat : 새로운 기능 구현
- fix : 버그, 오류 해결
- refactor : 전면 수정, 코드 리팩토링
- add : Feat 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성
- del : 쓸모없는 코드 삭제
- docs : README나 WIKI 등의 문서 수정
- [MERGE]: 다른 브랜치와 병합
- test : 테스트 코드 추가/작성

3. **MVP 설계**4
- 피그마 화면 설계 작성



---

## 📅 날짜
`2025-07-15`

---

## 오늘 한일
서비스 기능 정리, 기술 스택 고민

대기화면	방 생성/참여 선택, 카메라 상태 확인
방 생성 & 초대	방 코드, QR, URL을 생성해 친구를 초대
방 코드 참여(닉네임 설정)	다른 사용자가 만든 방에 코드 입력 후 참여(입장 시 닉네임 설정)
참여자 목록	현재 방에 있는 친구들 확인
카메라 옵션 설정	투명도, 크기 조절, 마우스로 카메라 위치 이동
배경 제거 & 얼굴만 표시	누끼 기능으로 배경 제거, 얼굴만 표시
배경 선택	다양한 배경을 선택할 수 있게함
사진 & 동영상 촬영	방장이 촬영 시작을 하면 모두 동시 촬영, 카운트다운 및 녹화
저장 & 공유	촬영 결과를 로컬 저장, 추후 S3 업로드 / URL & QR 공유
방 나가기 & 종료 처리	방장이 나가면 방이 종료되고 모든 사용자 연결 종료
추후 기능 (채팅, 히스토리 등)	방 채팅, 이전 영상 목록 조회, 에러 처리 등 확장 계획
추후 기능 (프레임 & 필터 선택)	원하는 테마로 꾸미기 (VHS, 폴라로이드, 하트 등)

고려중인 기술 스택
SpringBoot
MySQL JPA
Redis

## 오늘 배운 것
Jira 셋팅
애자일 :  소프트웨어 개발·프로젝트 관리 방식의 하나로, ‘변화에 유연하게 대응하면서 빠르게 가치를 전달’하는 것
핵심 가치 (애자일 선언문, 2001년)

프로세스와 도구보다 ‘개인과 상호작용’

포괄적 문서화보다 ‘실행 가능한 소프트웨어’

계약 협상보다 ‘고객 협력’

계획 준수보다 ‘변화에 대한 대응’


대표적인 프레임워크

스크럼(Scrum)

스프린트: 일반적으로 2~4주

역할: PO(Product Owner), 스크럼 마스터, 개발 팀

주요 이벤트: 스프린트 플래닝→데일리 스크럼→스프린트 리뷰→스프린트 회고

칸반(Kanban)

시각화 보드(Kanban 보드)로 업무 흐름(WIP 제한 포함)을 관리

업무 흐름의 연속성, 병목 최소화에 중점

XP(eXtreme Programming)

짝 프로그래밍, TDD(Test-Driven Development), 지속적 통합 등 기술 관행 강조



## 내일 할일
ERD
개발 환경 구축
API 명세서


---

## 📅 날짜
`2025-07-16`

---

## 🛠️ 오늘 한 일
개발 환경 셋팅
-Redis Docker 이미지 설치 및 기동
--docker pull redis:7.2 후 컨테이너 실행, 볼륨 마운트 적용
-Spring Boot-Redis 연동 작업
--spring-boot-starter-data-redis, spring-boot-starter-web 의존성 추가
--application.yml 작성(호스트·포트·DB 번호 설정)
--RedisConfig에서 RedisTemplate Bean 정의(키: String, 값: JSON)

-테스트 컨트롤러 구현
--RedisTestController에 /redis-test/{key}/{value} 엔드포인트 작성
--Lombok 설정 오류 해결(플러그인 설치·Annotation Processing 활성화)

-Gradle 빌드·실행
--./gradlew bootRun으로 애플리케이션 기동
--빌드 오류(DataSource, 의존성 누락 등) 디버깅 후 정상 구동 확인
-Redis 동작 검증
--브라우저에서 테스트 엔드포인트 호출 → 값 저장 및 반환 확인
--redis-cli monitor, info keyspace, select, keys 명령으로 실제 데이터 확인

## 📚 오늘 배운 것
Lettuce 클라이언트 특징: 비동기 NIO 기반, 스레드 세이프, Reactive API 기본 제공
Lombok 적용 요령: IDEA 플러그인 설치 + Enable annotation processing 필수
@RequiredArgsConstructor 활용: final 필드를 생성자 주입으로 자동 처리
Redis 직렬화 선택:
GenericJackson2JsonRedisSerializer → JSON 문자열 저장
필요 시 StringRedisSerializer로 교체해 평문 저장 가능
CLI로 Redis 데이터 탐색:
개발용 keys "*" / 운영권장 scan 0 match 패턴 count N
info keyspace로 DB별 키 개수 파악, select n으로 DB 전환
실시간 모니터링: monitor 명령으로 애플리케이션-Redis 트래픽 즉시 확인
Gradle 재로드·빌드 절차: IDEA Gradle 창 Refresh, ./gradlew clean build, 캐시 무효화 등

## 내일 할일
Backend 개발 시작
- 방 생성 API 작성


---

## 📅 날짜
`2025-07-17`

---

## 🛠️ 오늘 한 일
ERD 설계 전환 : 기존 Redis 단일 -> RDB (mySQL) + Redis 로 전환
API 명세 수정 : 요청폼 응답폼 변경
일부 DTO 작성 
CreateRoomRequest 
CreateRoomResponse 
JoinRoomRequest  
JoinRoomResponse



## 📚 오늘 배운 것
- `git stash` → 충돌 없이 브랜치 이동 & 재생성 흐름
- Git 커밋 템플릿 경로는 **절대경로** 또는 프로젝트‑루트 상대경로로 지정해야 오류 없음
- `OffsetDateTime` vs `ZonedDateTime` vs `LocalDateTime`  
  → API 응답에 **타임존 오프셋 포함**하려면 `OffsetDateTime`이 가장 안전
- Redis에서 **원자적 키 생성**: `SETNX` / Lua 스크립트 / `INCR` 활용해 중복 방지
- Spring Data Redis에서 `RedisTemplate<String,Object>` 기본 사용법 및 직렬화 확인
- JPA 사용 시 `spring.jpa.hibernate.ddl-auto`, `datasource` 설정 필수 항목 정리


## 내일 할일
DTO 완성
JPA 학습
API 작성 및 테스트
평가


---

## 📅 날짜
`2025-07-18`

---

## 🛠️ 오늘 한 일
AWS 인프라 전환

EC2 → SSH 접속 확인, MySQL 대신 RDS (MySQL 8.0) 인스턴스 생성

S3 버킷 clov-media-bucket 생성 (+ CORS JSON 적용, 퍼블릭 읽기 여부 결정)

IAM 사용자 clov-app 발급 → Access Key / Secret Key 확보

Spring Boot 환경설정

application.yml 작성: RDS DataSource, S3 프로퍼티, AWS 자격증명(환경변수 치환)

BackgroundServiceImpl S3 Presigned URL(v2 SDK) 리팩터링

ApiResponseDto + SuccessCodes 패턴으로 공통 응답 적용

Git 작업정리

git stash push/pop, 스태시 목록·삭제 명령 실습

병합된 브랜치 로컬/원격 삭제 명령 확인

##  📚 오늘 배운 것
RDS 연결 오류 트러블슈팅
Public access, Security Group 인바운드 TCP 3306 규칙, Workbench 접속 정보 매핑

S3 설정 전과정

버킷 퍼블릭 read·CORS(JSON)·Bucket Policy 작성

Presigned URL 업로드 vs 퍼블릭 URL 조회 방식

IAM 키 관리

Console > IAM > Users → Access Key 생성, Secret Key는 최초 1회만 노출

운영 시 환경변수·Secrets Manager 활용

YAML 주의점

JDBC URL은 한 줄 (멀티라인은 역따옴표/| 필요)

민감 정보는 ${ENV_VAR} 치환, .gitignore 만으로는 완전하지 않음

Git stash 사용법

git stash list / drop stash@{n} 로 불필요한 스태시 정리

브랜치 전환 → 최신 코드 pull → 스태시 pop 순서

##  🗓️ 내일 할 일
DTO 완성

Background 관련 요청·응답 DTO 최종 정리

방(Room) 도메인 CreateRoom / JoinRoom / ChangeBackground 전부 반영

JPA 학습 & 적용

리포지터리 쿼리 메서드 (findBy...Containing, 페이징) 실습

개발 DB(RDS) 에서 엔티티 매핑 검증

API 작성 및 테스트

컨트롤러 단위 테스트 (MockMvc) + 통합 테스트 환경 구성

Presigned URL 발급 → 프런트 업로드 플로우 E2E 확인

보안 강화 작업

S3 버킷: Public read 해제 & Presigned URL only 모드 확인

IAM 정책 최소 권한(버킷 한정 s3:PutObject,s3:GetObject) 재적용

TIL 자동 템플릿 스크립트 작성 (Optional)

매일 git log --since 로 오늘 커밋 요약 → TIL 마크다운 반자동 출력