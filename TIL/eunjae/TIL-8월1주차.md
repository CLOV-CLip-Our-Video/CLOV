### 🗓️ 2025-08-04 TIL
## ✅ 오늘 한 일
배포 서버 ci-cd 
- 스크립트로 브랜치 구분 -> 배포환경과 개발환경 분리

라운드로빈 방식 MediaPipe 적용
리소스 성능 4배 이상 증가 확인



### 🗓️ 2025-08-05 TIL
## ✅ 오늘 한 일
촬영 영상 파일 mp4 저장
axios util 해제하기

ai 배경생성 -> 실패
GPU 서버는 ssafy wifi 전용이었다!
ec2 는 cpu기반이라 기존 방식으로는 배경생성이 불가능
cpu기반 이미지 생성은 매우 느림..
colab? gpu서버 추가 고민

원격에서 삭제된 브랜치정리
git remote prune origin
git branch --merged develop	

빌드파일에서 application.yml 훔쳐보기
jar xf backend-0.0.1-SNAPSHOT.jar BOOT-INF/classes/application.yml
cat BOOT-INF/classes/application.yml



### 🗓️ 2025-08-06 TIL
## ✅ 오늘 한 일
nginx 수정, url 기반 라우팅 지원

coturn 프론트엔드에서 연동 , 모바일 접속 확인
그러나 로딩시간이 굉장히 김, 수정 필요

로깅 삭제


### 🗓️ 2025-08-07 TIL
## ✅ 오늘 한 일
coturn develop => stun이 작동하지 않는 문제 발생


얼굴만 필터 개발
mediapipe@facemesh 
기존 selfsegmentation과 동일하게, 라운드 로빈 방식의, cachedmask 기법으로 적용하였다.
적절하게 작동하는 듯하나, 한번 필터가 null이 되면 복구되지 않는다. 이 점을 고쳐야 한다.



### 🗓️ 2025-08-08 TIL
## ✅ 오늘 한 일
stun연결이 되지 않는 상황 해결 -> 그런데, 가끔 단방향 송출이 이뤄진다.
대체 어떻게????
offer -> receive 가 발생한 경우 offer 측은 receive의 영상이보이지만
receive는 offer측의 영상이 보이지 않는다.
 


s3에 txt파일을 올리면 utf-8이 깨지기 쉽다.
메타데이터를 따로 설정해주어야 한다.