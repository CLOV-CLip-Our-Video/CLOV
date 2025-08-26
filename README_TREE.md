
```
S13P11A209
├─ backend
│  ├─ build.gradle
│  ├─ gradle
│  │  └─ wrapper
│  │     ├─ gradle-wrapper.jar
│  │     └─ gradle-wrapper.properties
│  ├─ gradlew
│  ├─ gradlew.bat
│  ├─ settings.gradle
│  └─ src
│     ├─ main
│     │  ├─ java
│     │  │  └─ com
│     │  │     └─ clov
│     │  │        └─ backend
│     │  │           ├─ BackendApplication.java
│     │  │           ├─ common
│     │  │           │  ├─ config
│     │  │           │  │  ├─ AwsConfig.java
│     │  │           │  │  ├─ RedisConfig.java
│     │  │           │  │  ├─ SwaggerConfig.java
│     │  │           │  │  └─ WebConfig.java
│     │  │           │  ├─ domain
│     │  │           │  │  └─ BaseTimeEntity.java
│     │  │           │  ├─ enums
│     │  │           │  │  ├─ ContentType.java
│     │  │           │  │  └─ RoomStatus.java
│     │  │           │  ├─ exception
│     │  │           │  │  ├─ CustomException.java
│     │  │           │  │  ├─ GlobalExceptionHandler.java
│     │  │           │  │  └─ ResponseStatusSetterAdvice.java
│     │  │           │  ├─ metrics
│     │  │           │  │  ├─ RealTimeWebRTCMetrics.java
│     │  │           │  │  └─ RoomDistributionMetrics.java
│     │  │           │  ├─ redis
│     │  │           │  │  ├─ config
│     │  │           │  │  │  └─ RedisPubSubConfig.java
│     │  │           │  │  ├─ RedisExpirationListener.java
│     │  │           │  │  ├─ RedisPublisher.java
│     │  │           │  │  ├─ RedisSubscriber.java
│     │  │           │  │  └─ repository
│     │  │           │  │     └─ RedisRepository.java
│     │  │           │  ├─ response
│     │  │           │  │  ├─ ApiResponseDto.java
│     │  │           │  │  ├─ ErrorCode.java
│     │  │           │  │  └─ SuccessCode.java
│     │  │           │  └─ util
│     │  │           │     └─ RandomUtil.java
│     │  │           └─ domain
│     │  │              ├─ background
│     │  │              │  ├─ controller
│     │  │              │  │  └─ BackgroundController.java
│     │  │              │  ├─ dto
│     │  │              │  │  ├─ request
│     │  │              │  │  │  ├─ AIGenerateRequest.java
│     │  │              │  │  │  ├─ ChangeBackgroundRequest.java
│     │  │              │  │  │  └─ UploadBackgroundRequest.java
│     │  │              │  │  └─ response
│     │  │              │  │     ├─ BackgroundListResponse.java
│     │  │              │  │     ├─ BackgroundResponse.java
│     │  │              │  │     └─ UploadBackgroundResponse.java
│     │  │              │  ├─ entity
│     │  │              │  │  └─ Background.java
│     │  │              │  ├─ repository
│     │  │              │  │  └─ BackgroundRepository.java
│     │  │              │  └─ service
│     │  │              │     └─ BackgroundService.java
│     │  │              ├─ canvas
│     │  │              │  ├─ dto
│     │  │              │  │  ├─ CanvasStateDto.java
│     │  │              │  │  ├─ request
│     │  │              │  │  │  └─ SendCanvasStateRequest.java
│     │  │              │  │  └─ response
│     │  │              │  │     └─ FullCanvasStateResponse.java
│     │  │              │  └─ scheduler
│     │  │              │     └─ CanvasStateSyncScheduler.java
│     │  │              ├─ mediafile
│     │  │              │  ├─ controller
│     │  │              │  │  └─ MediaFileController.java
│     │  │              │  ├─ dto
│     │  │              │  │  ├─ request
│     │  │              │  │  │  ├─ MediaFileUploadRequest.java
│     │  │              │  │  │  └─ MediaFileUrlRequest.java
│     │  │              │  │  └─ response
│     │  │              │  │     ├─ MediaFileUploadResponse.java
│     │  │              │  │     └─ MediaFileURLResponse.java
│     │  │              │  ├─ entity
│     │  │              │  │  └─ MediaFile.java
│     │  │              │  ├─ repository
│     │  │              │  │  └─ MediaFileRepository.java
│     │  │              │  └─ service
│     │  │              │     └─ MediaFileService.java
│     │  │              ├─ participant
│     │  │              │  ├─ controller
│     │  │              │  │  └─ ParticipantController.java
│     │  │              │  ├─ dto
│     │  │              │  │  ├─ request
│     │  │              │  │  │  └─ ParticipantRequestDto.java
│     │  │              │  │  └─ response
│     │  │              │  │     └─ ParticipantResponseDto.java
│     │  │              │  ├─ entity
│     │  │              │  │  └─ Participant.java
│     │  │              │  ├─ repository
│     │  │              │  │  └─ ParticipantRepository.java
│     │  │              │  └─ service
│     │  │              │     └─ ParticipantService.java
│     │  │              ├─ room
│     │  │              │  ├─ controller
│     │  │              │  │  └─ RoomController.java
│     │  │              │  ├─ dto
│     │  │              │  │  ├─ request
│     │  │              │  │  │  ├─ RoomCreateRequestDto.java
│     │  │              │  │  │  └─ RoomHostUpdateRequestDto.java
│     │  │              │  │  └─ response
│     │  │              │  │     ├─ RoomCreateResponseDto.java
│     │  │              │  │     ├─ RoomLeftResponseDto.java
│     │  │              │  │     └─ RoomParticipantResponseDto.java
│     │  │              │  ├─ entity
│     │  │              │  │  └─ Room.java
│     │  │              │  ├─ repository
│     │  │              │  │  └─ RoomRepository.java
│     │  │              │  ├─ service
│     │  │              │  │  └─ RoomService.java
│     │  │              │  └─ websocket
│     │  │              │     ├─ RoomStateWebSocketHandler.java
│     │  │              │     ├─ WebSocketConfig.java
│     │  │              │     ├─ WebSocketMessageSender.java
│     │  │              │     └─ WebSocketSessionManager.java
│     │  │              ├─ roomstate
│     │  │              │  └─ dto
│     │  │              │     ├─ RoomMessageDto.java
│     │  │              │     └─ RoomStateResponse.java
│     │  │              └─ turn
│     │  │                 ├─ controller
│     │  │                 │  └─ TurnCredentialController.java
│     │  │                 ├─ dto
│     │  │                 │  └─ TurnCredentialResponse.java
│     │  │                 └─ service
│     │  │                    └─ TurnCredentialService.java
│     │  └─ resources
│     │     ├─ badwords.txt
│     │     ├─ data.sql
│     │     └─ logback-spring.xml
│     └─ test
│        └─ java
│           └─ com
│              └─ clov
│                 └─ backend
│                    ├─ BackendApplicationTests.java
│                    ├─ common
│                    │  ├─ redis
│                    │  │  └─ repository
│                    │  │     └─ RedisRepositoryTest.java
│                    │  └─ RedisConnectionTest.java
│                    └─ domain
│                       └─ room
│                          └─ service
│                             └─ RoomServiceTest.java
├─ BE_WebSocket_이벤트_수정_요청.md
├─ CLAUDE.md
├─ frontend
│  ├─ .env.example
│  ├─ .eslintrc.cjs
│  ├─ .prettierrc
│  ├─ clov.svg
│  ├─ dev-dist
│  │  ├─ registerSW.js
│  │  ├─ sw.js
│  │  ├─ workbox-54d0af47.js
│  │  └─ workbox-f001acab.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ clov.svg
│  │  ├─ icon-generator.html
│  │  └─ manifest.json
│  ├─ README.md
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ colors-cheese.css
│  │  │  ├─ colors-skyblue.css
│  │  │  ├─ images
│  │  │  │  ├─ characters
│  │  │  │  │  ├─ alien_click.png
│  │  │  │  │  ├─ alien_computer.png
│  │  │  │  │  ├─ alien_golden.png
│  │  │  │  │  ├─ alien_hello.png
│  │  │  │  │  └─ alien_selfie.png
│  │  │  │  ├─ landing
│  │  │  │  │  ├─ landing-temp-image.jpg
│  │  │  │  │  ├─ landing-temp-image.png
│  │  │  │  │  ├─ landing-temp-image1.png
│  │  │  │  │  ├─ landing-temp-image1111 (2).png
│  │  │  │  │  ├─ landing-temp-image123.png
│  │  │  │  │  ├─ landing-temp-image3.jpg
│  │  │  │  │  ├─ landing-temp-image4.png
│  │  │  │  │  └─ pookie_banner.png
│  │  │  │  └─ logos
│  │  │  │     ├─ icon.svg
│  │  │  │     ├─ logo.svg
│  │  │  │     └─ logo2.svg
│  │  │  └─ SVG
│  │  │     └─ alien-face-icon.svg
│  │  ├─ components
│  │  │  ├─ Camera
│  │  │  │  ├─ CameraControls
│  │  │  │  │  ├─ CameraControls.jsx
│  │  │  │  │  └─ CameraControls.module.css
│  │  │  │  ├─ CameraPreview
│  │  │  │  │  ├─ CameraPreview.jsx
│  │  │  │  │  └─ CameraPreview.module.css
│  │  │  │  └─ VideoStream
│  │  │  │     ├─ VideoStream.jsx
│  │  │  │     └─ VideoStream.module.css
│  │  │  ├─ common
│  │  │  │  ├─ Button
│  │  │  │  │  ├─ Button.jsx
│  │  │  │  │  ├─ Button.module.css
│  │  │  │  │  └─ README.md
│  │  │  │  ├─ Header
│  │  │  │  │  ├─ Header.jsx
│  │  │  │  │  └─ Header.module.css
│  │  │  │  ├─ Loading
│  │  │  │  │  ├─ Loading.jsx
│  │  │  │  │  └─ Loading.module.css
│  │  │  │  ├─ MediaSelector
│  │  │  │  │  ├─ MediaSelector.jsx
│  │  │  │  │  ├─ MediaSelector.module.css
│  │  │  │  │  ├─ MediaSelectorVertical.jsx
│  │  │  │  │  └─ MediaSelectorVertical.module.css
│  │  │  │  ├─ Modal
│  │  │  │  │  ├─ Modal.jsx
│  │  │  │  │  ├─ Modal.module.css
│  │  │  │  │  └─ README.md
│  │  │  │  ├─ PWAInstallModal
│  │  │  │  │  └─ PWAInstallModal.jsx
│  │  │  │  ├─ SideMenu
│  │  │  │  │  ├─ AiBackgroundModal.jsx
│  │  │  │  │  ├─ BackgroundUploadModal.jsx
│  │  │  │  │  ├─ SideMenu.jsx
│  │  │  │  │  └─ SideMenu.module.css
│  │  │  │  ├─ SliderBar
│  │  │  │  │  ├─ SliderBar.jsx
│  │  │  │  │  └─ SliderBar.module.css
│  │  │  │  ├─ Toast
│  │  │  │  │  └─ toast.js
│  │  │  │  ├─ Toast_backup
│  │  │  │  │  ├─ Toast.module.css
│  │  │  │  │  ├─ ToastTest.jsx
│  │  │  │  │  └─ Toast_backup.jsx
│  │  │  │  └─ VideoEffectsCanvas
│  │  │  │     └─ VideoEffectsCanvas.jsx
│  │  │  ├─ Recording
│  │  │  │  ├─ Countdown
│  │  │  │  │  ├─ Countdown.jsx
│  │  │  │  │  └─ Countdown.module.css
│  │  │  │  ├─ RecordingCanvas
│  │  │  │  │  ├─ constants
│  │  │  │  │  │  └─ touchConstants.js
│  │  │  │  │  ├─ hooks
│  │  │  │  │  │  └─ useTouchGestures.js
│  │  │  │  │  ├─ RecordingCanvas.jsx
│  │  │  │  │  └─ utils
│  │  │  │  │     ├─ gestureRecognition.js
│  │  │  │  │     └─ touchEventUtils.js
│  │  │  │  └─ RecordingControls
│  │  │  │     ├─ RecordingControls.jsx
│  │  │  │     └─ RecordingControls.module.css
│  │  │  ├─ Room
│  │  │  │  ├─ CameraModeSelector
│  │  │  │  │  └─ CameraModeSelector.jsx
│  │  │  │  ├─ EntryConsentModal
│  │  │  │  │  └─ EntryConsentModal.jsx
│  │  │  │  ├─ ParticipantList
│  │  │  │  │  ├─ ParticipantList.jsx
│  │  │  │  │  └─ ParticipantList.module.css
│  │  │  │  ├─ PermissionPrompt
│  │  │  │  │  └─ PermissionPrompt.jsx
│  │  │  │  └─ RoomInfo
│  │  │  │     ├─ components
│  │  │  │     │  ├─ AssignHostModal.jsx
│  │  │  │     │  ├─ VoiceVolumeBar.jsx
│  │  │  │     │  └─ VoiceVolumeBar.module.css
│  │  │  │     ├─ RoomInfo.jsx
│  │  │  │     └─ RoomInfo.module.css
│  │  │  └─ Share
│  │  │     ├─ DownloadButton
│  │  │     │  ├─ DownloadButton.jsx
│  │  │     │  └─ DownloadButton.module.css
│  │  │     ├─ index.js
│  │  │     ├─ SocialShare
│  │  │     │  ├─ SocialShare.jsx
│  │  │     │  └─ SocialShare.module.css
│  │  │     └─ VideoPreview
│  │  │        ├─ VideoPreview.jsx
│  │  │        └─ VideoPreview.module.css
│  │  ├─ hooks
│  │  │  ├─ useBeforeUnloadGuard.js
│  │  │  ├─ useCamera.js
│  │  │  ├─ useDeviceSettings.js
│  │  │  ├─ useMediaPermissions.js
│  │  │  ├─ useNavigationPrompt.js
│  │  │  ├─ useNavigationPromptWithModal.js
│  │  │  ├─ usePWAInstall.js
│  │  │  ├─ useRoomSocket.js
│  │  │  ├─ useSocketEvents.js
│  │  │  ├─ useVideoEffects.js
│  │  │  ├─ useViewport.js
│  │  │  └─ useWebRTC.js
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ ErrorPage
│  │  │  │  ├─ NotFound.jsx
│  │  │  │  └─ NotFound.module.css
│  │  │  ├─ LandingPage
│  │  │  │  ├─ components
│  │  │  │  │  ├─ ActionButtons
│  │  │  │  │  │  └─ ActionButtons.jsx
│  │  │  │  │  ├─ index.js
│  │  │  │  │  ├─ IntroSection
│  │  │  │  │  │  └─ IntroSection.jsx
│  │  │  │  │  ├─ LogoSection
│  │  │  │  │  │  └─ LogoSection.jsx
│  │  │  │  │  ├─ ServiceDescription
│  │  │  │  │  │  └─ ServiceDescription.jsx
│  │  │  │  │  └─ SpaceBackground
│  │  │  │  │     └─ SpaceBackground.jsx
│  │  │  │  ├─ constants
│  │  │  │  │  └─ index.js
│  │  │  │  ├─ hooks
│  │  │  │  │  ├─ index.js
│  │  │  │  │  ├─ useFallingAliens.js
│  │  │  │  │  ├─ useKeyboardEasterEgg.js
│  │  │  │  │  ├─ useRoomActions.js
│  │  │  │  │  └─ useScrollSnap.js
│  │  │  │  ├─ LandingPage.jsx
│  │  │  │  ├─ LandingPage.module.css
│  │  │  │  └─ styles
│  │  │  │     └─ spaceAnimations.css
│  │  │  ├─ RecordingRoom
│  │  │  │  ├─ components
│  │  │  │  │  ├─ Countdown
│  │  │  │  │  │  └─ Countdown.jsx
│  │  │  │  │  ├─ HelpModal
│  │  │  │  │  │  ├─ HelpModal.jsx
│  │  │  │  │  │  └─ HelpModal.module.css
│  │  │  │  │  ├─ index.js
│  │  │  │  │  ├─ MobileLayout
│  │  │  │  │  │  ├─ index.js
│  │  │  │  │  │  ├─ MiddlePanel.jsx
│  │  │  │  │  │  ├─ MobileControls.jsx
│  │  │  │  │  │  ├─ MobileHeader.jsx
│  │  │  │  │  │  └─ MobileLayout.jsx
│  │  │  │  │  ├─ RecordingControls
│  │  │  │  │  │  ├─ RecordingControls.jsx
│  │  │  │  │  │  └─ RecordingControls.module.css
│  │  │  │  │  └─ SaveModal
│  │  │  │  │     ├─ SaveModal.jsx
│  │  │  │  │     └─ SaveModal.module.css
│  │  │  │  ├─ RecordingRoom.jsx
│  │  │  │  ├─ RecordingRoom.module.css
│  │  │  │  └─ styles
│  │  │  │     ├─ mobile.module.css
│  │  │  │     ├─ portrait.module.css
│  │  │  │     └─ responsive.module.css
│  │  │  └─ WaitingRoom
│  │  │     ├─ components
│  │  │     │  ├─ EnterRoomButton
│  │  │     │  │  ├─ EnterRoomButton.jsx
│  │  │     │  │  └─ EnterRoomButton.module.css
│  │  │     │  ├─ FilterSelector
│  │  │     │  │  ├─ FilterSelector.jsx
│  │  │     │  │  └─ FilterSelector.module.css
│  │  │     │  ├─ NicknameModal
│  │  │     │  │  ├─ NicknameModal.jsx
│  │  │     │  │  ├─ NicknameModal.module.css
│  │  │     │  │  └─ profaneFilter.js
│  │  │     │  ├─ OpacitySettings
│  │  │     │  │  ├─ OpacitySettings.jsx
│  │  │     │  │  └─ OpacitySettings.module.css
│  │  │     │  ├─ SegmentationModeSelector
│  │  │     │  │  ├─ SegmentationModeSelector.jsx
│  │  │     │  │  └─ SegmentationModeSelector.module.css
│  │  │     │  ├─ UserInfoCard
│  │  │     │  │  ├─ UserInfoCard.jsx
│  │  │     │  │  └─ UserInfoCard.module.css
│  │  │     │  └─ VideoPreview
│  │  │     │     ├─ VideoPreview.jsx
│  │  │     │     └─ VideoPreview.module.css
│  │  │     ├─ hooks
│  │  │     │  └─ useRoomEntry.js
│  │  │     ├─ WaitingRoom.jsx
│  │  │     └─ WaitingRoom.module.css
│  │  ├─ services
│  │  │  ├─ apiUtils.js
│  │  │  ├─ socket.js
│  │  │  └─ turnService.js
│  │  ├─ stores
│  │  │  ├─ cameraStore.js
│  │  │  ├─ canvasParticipantsStore.js
│  │  │  ├─ index.js
│  │  │  ├─ recordingStore.js
│  │  │  ├─ roomStore.js
│  │  │  ├─ sessionStore.js
│  │  │  ├─ userStore.js
│  │  │  └─ videoEffectsStore.js
│  │  ├─ styles
│  │  │  └─ globals.css
│  │  └─ utils
│  │     ├─ aiFilters.js
│  │     ├─ backgroundProcessor.js
│  │     ├─ canvasUtils.js
│  │     ├─ constants.js
│  │     ├─ deviceUtils.js
│  │     ├─ helpers.js
│  │     ├─ mediaUtils.js
│  │     ├─ optimizedSegmentationUtils.js
│  │     ├─ pwaUtils.js
│  │     ├─ safelyLeaveRoom.js
│  │     ├─ segmentationUtils.js
│  │     └─ videoFilters.js
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ PWA_사용법.md
├─ README.md
└─ TIL
   ├─ eunjae
   │  ├─ TIL-7월2주차.md
   │  ├─ TIL-7월3주차.md
   │  ├─ TIL-7월4주차.md
   │  ├─ TIL-8월1주차.md
   │  └─ TIL-8월2주차.md
   ├─ gabae
   │  ├─ TIL250714.md
   │  ├─ TIL250715.md
   │  ├─ TIL250716.md
   │  ├─ TIL250717.md
   │  ├─ TIL250718.md
   │  ├─ TIL250721.md
   │  ├─ TIL250722.md
   │  ├─ TIL250723.md
   │  ├─ TIL250724.md
   │  ├─ TIL250725.md
   │  ├─ TIL250728.md
   │  ├─ TIL250729.md
   │  ├─ TIL250730.md
   │  ├─ TIL250731.md
   │  ├─ TIL250801.md
   │  ├─ TIL250804.md
   │  ├─ TIL250805.md
   │  ├─ TIL250806.md
   │  ├─ TIL250807.md
   │  ├─ TIL250808.md
   │  └─ TIL250811.md
   ├─ hyeonseok
   │  ├─ TIL250714.md
   │  ├─ TIL250715.md
   │  ├─ TIL250716.md
   │  ├─ TIL250717.md
   │  ├─ TIL250718.md
   │  ├─ TIL250720.md
   │  ├─ TIL250721.md
   │  ├─ TIL250722.md
   │  ├─ TIL250723.md
   │  ├─ TIL250724.md
   │  ├─ TIL250728.md
   │  ├─ TIL250729.md
   │  ├─ TIL250730.md
   │  ├─ TIL250805.md
   │  └─ TIL250808.md
   ├─ seungyeon
   │  ├─ template.md
   │  ├─ TIL250714.md
   │  ├─ TIL250715.md
   │  ├─ TIL250716.md
   │  ├─ TIL250717.md
   │  ├─ TIL250718.md
   │  ├─ TIL250721.md
   │  ├─ TIL250722.md
   │  ├─ TIL250723.md
   │  ├─ TIL250724.md
   │  ├─ TIL250725.md
   │  ├─ TIL250728.md
   │  ├─ TIL250729.md
   │  ├─ TIL250801.md
   │  ├─ TIL250804.md
   │  ├─ TIL250805.md
   │  ├─ TIL250806.md
   │  ├─ TIL250807.md
   │  ├─ TIL250808.md
   │  └─ TIL250811.md
   ├─ yerin
   │  ├─ TIL_250714.md
   │  ├─ TIL_250715.md
   │  ├─ TIL_250716.md
   │  ├─ TIL_250717.md
   │  ├─ TIL_250718.md
   │  ├─ TIL_250721.md
   │  ├─ TIL_250722.md
   │  ├─ TIL_250723.md
   │  ├─ TIL_250724.md
   │  ├─ TIL_250725.md
   │  ├─ TIL_250728.md
   │  ├─ TIL_250729.md
   │  ├─ TIL_250730.md
   │  ├─ TIL_250801.md
   │  ├─ TIL_250804.md
   │  ├─ TIL_250805.md
   │  ├─ TIL_250807.md
   │  ├─ TIL_250808.md
   │  ├─ TIL_250811.md
   │  └─ TIL_250812.md
   └─ youngwoo
      ├─ TIL250714.md
      ├─ TIL250715.md
      ├─ TIL250716.md
      ├─ TIL250717.md
      ├─ TIL250718.md
      ├─ TIL250721.md
      ├─ TIL250722.md
      ├─ TIL250723.md
      ├─ TIL250724.md
      ├─ TIL250725.md
      ├─ TIL250728.md
      ├─ TIL250729.md
      ├─ TIL250730.md
      ├─ TIL250731.md
      ├─ TIL250801.md
      ├─ TIL250804.md
      └─ TIL250805.md

```