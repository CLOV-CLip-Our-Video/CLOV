# 🍀 CLOV : CLip Our Video



## 서비스 소개

>
> “모이고, 찍고, 공유 하세요!”
>  
> 실시간 P2P 포토 부스로 어디서든 함께 사진·영상 촬영
> 

#### 서비스 소개 영상
<div align="center">
  <a href="https://www.youtube.com/watch?v=MoQZfgaZc_E">
    <img src="https://img.youtube.com/vi/MoQZfgaZc_E/maxresdefault.jpg" alt="CLOV 서비스 소개 영상" width="600">
    <br><br>
    <img src="https://img.shields.io/badge/▶️_영상으로_보는_CLOV-FF0000?style=for-the-badge&logo=youtube&logoColor=white">
  </a>
</div>

**언제 어디서든 함께 찍고, 공유하는 온라인 포토 부스**

현대 사회에서 **즉석 기록과 추억을 공유하는 방식**은 지속적으로 진화하고 있습니다.

많은 사람들은 인생**, 모노**, **필름 등 **오프라인 포토부스**를 이용해 특별한 순간을 남기지만,

- **같이 가야 한다는 물리적 제약**
- **지방이나 해외처럼 멀리 떨어진 사람들과 함께 촬영하기 어려운 점**

등의 불편함이 존재합니다.

물론 온라인에서는 친구들과 화상으로 스터디를 하거나 잡담을 나눌 수 있지만,

**멀리 있어도 같은 프레임 안에 나란히 찍히는 경험**을 제공하는 서비스는 없었습니다.

이러한 상황에서, 우리는 다음과 같은 경험을 제공하고자 합니다:

✅ **포토부스에 가지 않아도**

✅ **멀리 있어도 옆에 있는 것처럼**

✅ **언제 어디서든 누구와든 함께 촬영할 수 있는**

새로운 형태의 **실시간 온라인 포토부스 서비스**입니다.

| 주요 기능 | 상세 설명 |
| --- | --- |
| **간단한 사용** | 회원가입, 설치 없이 브라우저만으로 쉽고 빠른 접속 |
| **초대 링크 공유** | 초대 링크 생성 & 원클릭 접속, 방당 최대 6명이 동시 이용 가능 |
| **AI 사용자 배경 제거** | 사생활 유출 걱정은 이제 그만! AI기반 배경 제거 기능 제공  |
| **커스텀 캔버스 업로드** | 내 사진·배경 이미지 등 원하는 이미지를 드래그-앤-드롭으로 즉시 사용! |
| **AI 캔버스 생성** | 배경 고르기 어려울 땐? 프롬프트로 바로 AI 이미지 생성, 프롬프트 자동 생성 기능까지! |
| **사용자간 음성 대화** | 자유롭게 소통해요. real-time 고품질 음성 통신 지원! |
| **자유로운 레이아웃** | 고정된 프레임은 이제 그만, 자유로운 위치·크기·투명도·각도 실시간 조정! |
| **개성넘치는 오버레이** | 선글라스부터, 다양한 분장까지! AI 기반 얼굴 인식으로 알아서 딱맞게! |
| **원클릭 촬영·다운로드** | 원클릭 촬영 완료 후 결과물 무제한 PNG/MP4 저장! |
| **HTTPS·WebSocket 보안** | openSSL기반 인증 및 TLS 암호화, WebRTC E2E 보호 |


## 아키텍쳐
![architecture](https://github.com/user-attachments/assets/043d05a2-04d1-4232-b903-5cd28e73c703)

## API 명세
[API 명세서 바로가기](https://yxin.notion.site/API-2297c9100471819b8c22c55fe0bcf8c2?source=copy_link)


## ERD
![erd](https://github.com/user-attachments/assets/f768e1f9-13e6-4c34-9d15-36a98465a9cd)

## 기술 스택

🖥️ **Backend**  
OpenJDK (1.8.0_192) · Spring Boot (3.5.3) · Gradle (8.14.3) · Redis (7.4.5) · MySQL (8.0.43)  

🛠️ **Infra**  
Docker (20.10.17) · NginX (1.18.0) · Jenkins (2.346)  

💻 **Frontend**  
React (19.1.0) · Zustand (5.0.6) · Tailwind CSS (3.4.17) · Vite (7.0.4) · Prettier (3.6.2)  

📊 **Monitoring & Test Tools**  
Prometheus · Grafana · k6 · InfluxDB · WebPerf 


## 팀원 소개

| 👑 이예린 | 전가배 | 김은재 |
| --- | --- | --- |
| Backend |Backend  | Backend |

| 이현석 | 조영우  | 박승연 |
| --- | --- | --- |
| Frontend | Frontend | Frontend |
