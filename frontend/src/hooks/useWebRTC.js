// useWebRTC v1 - 효율성 개선 버전
import { useRef, useCallback, useEffect } from 'react';
import { useCameraStore } from '../stores';
import { sendEvent } from '../services/socket';
import useRoomStore from '../stores/roomStore';
import { getTurnCredentials } from '../services/turnService';
import {
  startMetricsCollection,
  stopMetricsCollection,
} from '../services/apiUtils';

export const useWebRTC = () => {
  const peerConnectionsRef = useRef({});
  const remoteVideoElementsRef = useRef({});
  const metricsIntervalRef = useRef(null);

  // 🔄 효율적인 상태 관리
  const connectionStateRef = useRef({});
  const negotiationLockRef = useRef({});
  const backoffTimerRef = useRef({}); // 백오프 타이머

  const { localStream, processedStream } = useCameraStore();
  const { clientId } = useRoomStore();

  // 최적화된 연결 설정
  const CONNECTION_CONFIG = {
    stunTimeout: 5000,        // STUN 타임아웃 단축 (6초 → 5초)
    turnTimeout: 10000,       // TURN 타임아웃 증가 (8초 → 10초)
    maxStunRetries: 1,        // STUN 재시도 1회만
    negotiationDelay: 500,    // 협상 지연 단축 (1초 → 0.5초)
    backoffMultiplier: 1.5,   // 백오프 배수
    maxBackoffDelay: 30000,   // 최대 백오프 지연 (30초)
    minBackoffDelay: 1000,    // 최소 백오프 지연
    cooldownPeriod: 60000,    // 쿨다운 주기 (1분)
    maxConsecutiveRetries: 3, // 연속 재시도 한계
  };

  const localTieBreaker = BigInt.asUintN(64, 
    (BigInt(crypto.getRandomValues(new Uint32Array(2))[0]) << 32n) |
    BigInt(crypto.getRandomValues(new Uint32Array(2))[1])
  );

  const getBasicRtcConfig = () => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceTransportPolicy: 'all',
    iceCandidatePoolSize: 3, // 풀 크기 감소 (5 → 3)
    bundlePolicy: 'max-bundle',
  });

  const getTurnRtcConfig = async () => {
    try {
      const turnCreds = await getTurnCredentials(clientId);
      return {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:turn.clov.co.kr:3478?transport=udp',
            username: turnCreds.username,
            credential: turnCreds.credential,
          },
          {
            urls: 'turn:turn.clov.co.kr:3478?transport=tcp',
            username: turnCreds.username,
            credential: turnCreds.credential,
          },
          {
            urls: 'turns:turn.clov.co.kr:5349?transport=tcp',
            username: turnCreds.username,
            credential: turnCreds.credential,
          },
        ],
        iceTransportPolicy: 'all',
        iceCandidatePoolSize: 8, // TURN용 풀 크기 (10 → 8)
        bundlePolicy: 'max-bundle',
      };
    } catch (error) {
      //console.error('❌ TURN 자격증명 실패:', error);
      return getBasicRtcConfig();
    }
  };

  // 🔧 연결 상태 초기화
  const initializeConnectionState = (targetClientId) => {
    connectionStateRef.current[targetClientId] = {
      retryCount: 0,
      useTurn: false,
      lastAttempt: 0,
      isConnecting: false,
      failureReasons: [],
      consecutiveFailures: 0, // 연속 실패 횟수
      lastSuccessfulAttempt: 0, // 마지막 성공 시간
      isInCooldown: false, // 쿨다운 상태
    };
  };

  // 🔧 백오프 계산 (절대 포기하지 않음)
  const calculateBackoffDelay = (targetClientId) => {
    const state = connectionStateRef.current[targetClientId];
    if (!state) return CONNECTION_CONFIG.minBackoffDelay;

    // 연속 실패가 적으면 짧은 지연
    if (state.consecutiveFailures <= CONNECTION_CONFIG.maxConsecutiveRetries) {
      return CONNECTION_CONFIG.minBackoffDelay;
    }

    // 연속 실패가 많으면 점진적 증가 (하지만 포기하지 않음)
    const backoffLevel = state.consecutiveFailures - CONNECTION_CONFIG.maxConsecutiveRetries;
    const exponentialDelay = CONNECTION_CONFIG.minBackoffDelay * 
      Math.pow(CONNECTION_CONFIG.backoffMultiplier, backoffLevel);
    
    return Math.min(exponentialDelay, CONNECTION_CONFIG.maxBackoffDelay);
  };

  // 🔧 상태 정리 함수
  const cleanupConnection = useCallback((targetClientId) => {
    // 백오프 타이머 정리
    if (backoffTimerRef.current[targetClientId]) {
      clearTimeout(backoffTimerRef.current[targetClientId]);
      delete backoffTimerRef.current[targetClientId];
    }

    // PeerConnection 정리
    if (peerConnectionsRef.current[targetClientId]) {
      peerConnectionsRef.current[targetClientId].close();
      delete peerConnectionsRef.current[targetClientId];
    }

    // 비디오 엘리먼트 정리
    if (remoteVideoElementsRef.current[targetClientId]) {
      remoteVideoElementsRef.current[targetClientId].remove();
      delete remoteVideoElementsRef.current[targetClientId];
    }

    // 상태 정리
    delete connectionStateRef.current[targetClientId];
    delete negotiationLockRef.current[targetClientId];

    //console.log(`🧹 연결 정리 완료: ${targetClientId}`);
  }, []);

  // 🔧 TURN 전환 결정 로직 (더 적극적)
  const shouldUseTurnServer = useCallback((targetClientId) => {
    const state = connectionStateRef.current[targetClientId];
    if (!state) return false;

    // 이미 TURN 사용 중이면 계속 사용
    if (state.useTurn) return true;

    // 첫 번째 STUN 실패 시 즉시 TURN 전환
    if (state.retryCount >= CONNECTION_CONFIG.maxStunRetries) {
      return true;
    }

    // 네트워크 이슈 패턴 감지 시 즉시 TURN
    if (state.failureReasons.includes('timeout')) {
      return true;
    }

    return false;
  }, []);

  // 🔧 연결 상태 확인
  const isConnectionActive = useCallback((targetClientId) => {
    const pc = peerConnectionsRef.current[targetClientId];
    if (!pc) return false;

    const connectionState = pc.connectionState;
    const iceConnectionState = pc.iceConnectionState;

    return (
      connectionState === 'connected' ||
      iceConnectionState === 'connected' ||
      iceConnectionState === 'completed'
    );
  }, []);

  // 🔧 개선된 PeerConnection 생성
  const createPeerConnection = useCallback(async (targetClientId, isInitiator = false, forceCreate = false) => {
    const now = Date.now();
    
    // 활성 연결 확인
    if (!forceCreate && isConnectionActive(targetClientId)) {
      //console.log(`✅ 이미 활성 연결 존재: ${targetClientId}`);
      return null;
    }

    // 너무 빠른 재시도 방지 (단, forceCreate는 예외)
    const state = connectionStateRef.current[targetClientId];
    if (!forceCreate && state?.lastAttempt && (now - state.lastAttempt) < CONNECTION_CONFIG.negotiationDelay) {
      //console.log(`⏰ 재시도 지연 중: ${targetClientId}`);
      return null;
    }

    // 상태 초기화
    if (!state) {
      initializeConnectionState(targetClientId);
    }

    const connectionState = connectionStateRef.current[targetClientId];
    connectionState.lastAttempt = now;
    connectionState.isConnecting = true;

    const useTurn = shouldUseTurnServer(targetClientId);
    connectionState.useTurn = useTurn;

    //console.log(`🔗 PeerConnection 생성: ${targetClientId} (${useTurn ? 'TURN' : 'STUN'}) [시도: ${connectionState.retryCount + 1}]`);

    // 기존 연결 정리
    if (peerConnectionsRef.current[targetClientId]) {
      peerConnectionsRef.current[targetClientId].close();
    }

    const rtcConfig = useTurn ? await getTurnRtcConfig() : getBasicRtcConfig();
    const peerConnection = new RTCPeerConnection(rtcConfig);
    peerConnectionsRef.current[targetClientId] = peerConnection;

    // ⏰ 연결 타임아웃 설정 (TURN일 때 더 관대하게)
    const timeout = useTurn ? CONNECTION_CONFIG.turnTimeout : CONNECTION_CONFIG.stunTimeout;
    const connectionTimeout = setTimeout(() => {
      if (peerConnection.iceConnectionState === 'checking' || 
          peerConnection.iceConnectionState === 'new') {
        //console.log(`⏰ 연결 타임아웃: ${targetClientId} (${timeout}ms)`);
        connectionState.failureReasons.push('timeout');
        handleConnectionFailure(targetClientId, isInitiator);
      }
    }, timeout);

    // 🔗 연결 상태 변경 핸들러
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      //console.log(`🔗 연결 상태: ${targetClientId} - ${state} (${useTurn ? 'TURN' : 'STUN'})`);

      if (state === 'connected') {
        clearTimeout(connectionTimeout);
        connectionState.isConnecting = false;
        connectionState.retryCount = 0;
        connectionState.failureReasons = [];
        connectionState.consecutiveFailures = 0; // 성공 시 연속 실패 리셋
        connectionState.lastSuccessfulAttempt = Date.now(); // 성공 시간 기록
        connectionState.isInCooldown = false; // 쿨다운 해제
        //console.log(`✅ 연결 성공: ${targetClientId} (${useTurn ? 'TURN' : 'STUN'})`);
      } else if (state === 'failed') {
        clearTimeout(connectionTimeout);
        connectionState.failureReasons.push('connection-failed');
        handleConnectionFailure(targetClientId, isInitiator);
      }
    };

    // 🧊 ICE 연결 상태 변경 핸들러
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      //console.log(`🧊 ICE 상태: ${targetClientId} - ${iceState} (${useTurn ? 'TURN' : 'STUN'})`);

      if (iceState === 'connected' || iceState === 'completed') {
        clearTimeout(connectionTimeout);
        connectionState.consecutiveFailures = 0; // ICE 연결 성공 시 리셋
        connectionState.lastSuccessfulAttempt = Date.now(); // 성공 시간 기록
        connectionState.isInCooldown = false; // 쿨다운 해제
      } else if (iceState === 'failed') {
        connectionState.failureReasons.push('ice-failed');
        handleConnectionFailure(targetClientId, isInitiator);
      } else if (iceState === 'disconnected') {
        // 연결 끊김 시 백오프 적용해서 재연결 (절대 포기하지 않음)
        const backoffDelay = calculateBackoffDelay(targetClientId);
        //console.log(`🔌 연결 끊김, ${backoffDelay}ms 후 재연결 시도: ${targetClientId}`);
        
        backoffTimerRef.current[targetClientId] = setTimeout(() => {
          //console.log(`🔄 재연결 시도: ${targetClientId}`);
          createPeerConnection(targetClientId, isInitiator);
        }, backoffDelay);
      }
    };

    // 📺 스트림 처리
    const streamToUse = processedStream || localStream;
    if (streamToUse) {
      streamToUse.getTracks().forEach((track) => {
        peerConnection.addTrack(track, streamToUse);
      });
    }

    peerConnection.ontrack = (event) => {
      //console.log(`📺 원격 스트림 수신: ${targetClientId}`);
      const [remoteStream] = event.streams;
      
      setTimeout(() => {
        // 기존 비디오 엘리먼트 제거
        if (remoteVideoElementsRef.current[targetClientId]) {
          remoteVideoElementsRef.current[targetClientId].remove();
        }

        const videoElement = document.createElement('video');
        videoElement.srcObject = remoteStream;
        videoElement.autoplay = true;
        videoElement.muted = false;
        videoElement.playsInline = true;
        videoElement.style.display = 'none';
        document.body.appendChild(videoElement);

        remoteVideoElementsRef.current[targetClientId] = videoElement;
      }, 100);
    };

    // 🧊 ICE candidate 처리
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendEvent('ice-candidate', {
          target: targetClientId,
          source: clientId,
          candidate: event.candidate,
        });
      }
    };

    // 📤 Offer 생성 (initiator인 경우)
    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        sendEvent('sdp-offer', {
          target: targetClientId,
          source: clientId,
          offer: offer,
          tiebreaker: localTieBreaker.toString(),
          useTurn: useTurn, // 🔧 TURN 사용 여부 명시
        });
      } catch (error) {
        //console.error(`❌ Offer 생성 실패: ${targetClientId}`, error);
        handleConnectionFailure(targetClientId, isInitiator);
      }
    }

    return peerConnection;
  }, [localStream, processedStream, clientId, shouldUseTurnServer, isConnectionActive]);

  // 🔧 연결 실패 처리 (절대 포기하지 않는 백오프 적용)
  const handleConnectionFailure = useCallback((targetClientId, isInitiator) => {
    const state = connectionStateRef.current[targetClientId];
    if (!state) return;

    state.retryCount++;
    state.consecutiveFailures++;
    state.isConnecting = false;

    //console.log(`❌ 연결 실패: ${targetClientId} (연속실패: ${state.consecutiveFailures}회)`);

    // 연속 실패가 많으면 쿨다운 모드 진입 (하지만 포기하지 않음)
    if (state.consecutiveFailures > CONNECTION_CONFIG.maxConsecutiveRetries) {
      state.isInCooldown = true;
      
      const backoffDelay = calculateBackoffDelay(targetClientId);
      //console.log(`🕐 백오프 지연 ${backoffDelay}ms 후 재시도: ${targetClientId}`);
      
      backoffTimerRef.current[targetClientId] = setTimeout(() => {
        //console.log(`🔄 백오프 후 재시도: ${targetClientId}`);
        state.isInCooldown = false;
        createPeerConnection(targetClientId, isInitiator);
      }, backoffDelay);
      
      return;
    }

    // 일반적인 재시도 (짧은 지연)
    const retryDelay = CONNECTION_CONFIG.minBackoffDelay;
    //console.log(`🔄 ${retryDelay}ms 후 즉시 재시도: ${targetClientId}`);
    
    backoffTimerRef.current[targetClientId] = setTimeout(() => {
      createPeerConnection(targetClientId, isInitiator);
    }, retryDelay);
  }, [createPeerConnection]);

  // 📨 Offer 처리 (무중단 처리)
  const handleOffer = useCallback(async (data) => {
    try {
      const sourceClientId = data.source || data.clientId;
      if (!sourceClientId) return;

      //console.log('📨 SDP Offer 수신:', sourceClientId);

      // 활성 연결 확인
      if (isConnectionActive(sourceClientId)) {
        //console.log(`✅ 이미 연결됨, Offer 무시: ${sourceClientId}`);
        return;
      }

      // 🔒 협상 잠금 (더 짧은 시간)
      if (negotiationLockRef.current[sourceClientId]) {
        //console.log(`🔒 협상 진행 중, Offer 대기: ${sourceClientId}`);
        // 짧은 지연 후 재시도
        setTimeout(() => handleOffer(data), 200);
        return;
      }
      negotiationLockRef.current[sourceClientId] = true;

      // Glare 처리
      const existingPc = peerConnectionsRef.current[sourceClientId];
      const weAreMakingOffer = existingPc && existingPc.signalingState === 'have-local-offer';

      if (weAreMakingOffer) {
        const theirTieBreaker = BigInt(data.tiebreaker || 0);
        if (localTieBreaker > theirTieBreaker) {
          //console.log(`🎲 Glare 해결: Offer 무시 (${sourceClientId})`);
          delete negotiationLockRef.current[sourceClientId];
          return;
        }
        //console.log(`🎲 Glare 해결: 로컬 Offer 롤백 (${sourceClientId})`);
        try {
          await existingPc.setLocalDescription({ type: 'rollback' });
        } catch (rollbackError) {
          //console.warn('Rollback 실패:', rollbackError);
        }
      }

      // 🔧 상대방 TURN 상태 동기화
      const shouldUseTurn = data.useTurn || shouldUseTurnServer(sourceClientId);
      
      // 상태 초기화
      if (!connectionStateRef.current[sourceClientId]) {
        initializeConnectionState(sourceClientId);
      }
      connectionStateRef.current[sourceClientId].useTurn = shouldUseTurn;

      // PeerConnection 생성 (forceCreate = true)
      const peerConnection = await createPeerConnection(sourceClientId, false, true);
      if (!peerConnection) {
        delete negotiationLockRef.current[sourceClientId];
        return;
      }

      // Offer 처리
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      sendEvent('sdp-answer', {
        target: sourceClientId,
        source: clientId,
        answer: answer,
        useTurn: shouldUseTurn, // 🔧 TURN 상태 응답
      });

      // 협상 잠금 해제 (더 빠르게)
      setTimeout(() => {
        delete negotiationLockRef.current[sourceClientId];
      }, 500);

    } catch (error) {
      //console.error('❌ Offer 처리 실패:', error);
      delete negotiationLockRef.current[sourceClientId];
    }
  }, [createPeerConnection, clientId, shouldUseTurnServer, isConnectionActive]);

  // 📨 Answer 처리
  const handleAnswer = useCallback(async (data) => {
    try {
      const sourceClientId = data.source || data.clientId;
      if (!sourceClientId) return;

      const peerConnection = peerConnectionsRef.current[sourceClientId];
      if (!peerConnection) return;

      //console.log('📨 SDP Answer 수신:', sourceClientId);

      if (peerConnection.signalingState === 'have-local-offer') {
        await peerConnection.setRemoteDescription(data.answer);
        
        // 🔧 상대방 TURN 상태 동기화
        if (data.useTurn && connectionStateRef.current[sourceClientId]) {
          connectionStateRef.current[sourceClientId].useTurn = data.useTurn;
        }
      }
    } catch (error) {
      //console.error('❌ Answer 처리 실패:', error);
    }
  }, []);

  // 🧊 ICE Candidate 처리 (안정성 강화)
  const handleIceCandidate = useCallback(async (data) => {
    try {
      const sourceClientId = data.source || data.clientId;
      if (!sourceClientId) return;

      const peerConnection = peerConnectionsRef.current[sourceClientId];
      
      // PeerConnection 상태 확인
      if (!peerConnection || peerConnection.signalingState === 'closed') {
        //console.warn(`⚠️ PeerConnection 닫힘, ICE candidate 무시: ${sourceClientId}`);
        return;
      }

      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(data.candidate);
      } else {
        // 지연 추가 (더 짧은 지연)
        setTimeout(async () => {
          const pc = peerConnectionsRef.current[sourceClientId];
          if (pc && pc.remoteDescription && pc.signalingState !== 'closed') {
            try {
              await pc.addIceCandidate(data.candidate);
            } catch (e) {
              //console.error('ICE candidate 지연 추가 실패:', e);
            }
          }
        }, 500); // 1초 → 0.5초로 단축
      }
    } catch (error) {
      //console.error('❌ ICE candidate 처리 실패:', error);
    }
  }, []);

  // 🤝 새 참가자 연결 (백오프 확인)
  const connectToNewParticipant = useCallback((participantId) => {
    if (participantId === clientId) return;

    //console.log(`🤝 새 참가자 연결: ${participantId}`);

    // 이미 활성 연결이 있으면 보호
    if (isConnectionActive(participantId)) {
      //console.log(`✅ 기존 연결 유지: ${participantId}`);
      return;
    }

    // 쿨다운 중인지 확인
    if (backoffTimerRef.current[participantId]) {
      //console.log(`🕐 백오프 진행 중, 연결 시도 연기: ${participantId}`);
      return;
    }

    // 상태 확인 및 쿨다운 체크
    const state = connectionStateRef.current[participantId];
    if (state?.isInCooldown) {
      //console.log(`❄️ 쿨다운 중, 연결 시도 연기: ${participantId}`);
      return;
    }

    // 연속 실패한 경우에만 쿨다운 주기 경과 시 상태 리셋
    if (state?.consecutiveFailures > 0 && state?.lastAttempt) {
      const timeSinceLastAttempt = Date.now() - state.lastAttempt;
      if (timeSinceLastAttempt > CONNECTION_CONFIG.cooldownPeriod) {
        //console.log(`🔄 실패 후 쿨다운 주기 경과, 상태 리셋: ${participantId}`);
        initializeConnectionState(participantId);
      }
    }

    // 상태 초기화 및 연결 시도
    if (!state) {
      initializeConnectionState(participantId);
    }
    
    setTimeout(() => {
      createPeerConnection(participantId, true);
    }, CONNECTION_CONFIG.negotiationDelay);
  }, [clientId, createPeerConnection, isConnectionActive]);

  // 🔌 참가자 연결 해제
  const disconnectParticipant = useCallback((participantId) => {
    //console.log(`🔌 참가자 연결 해제: ${participantId}`);
    cleanupConnection(participantId);
  }, [cleanupConnection]);

  // Metrics 수집
  useEffect(() => {
    metricsIntervalRef.current = startMetricsCollection(peerConnectionsRef, clientId);
    return () => {
      stopMetricsCollection(metricsIntervalRef.current);
    };
  }, [peerConnectionsRef, clientId]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 모든 백오프 타이머 정리
      Object.values(backoffTimerRef.current).forEach(timer => clearTimeout(timer));
      
      // 모든 연결 정리
      Object.keys(peerConnectionsRef.current).forEach(cleanupConnection);
    };
  }, [cleanupConnection]);

  return {
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    connectToNewParticipant,
    disconnectParticipant,
    peerConnectionsRef,
    remoteVideoElements: remoteVideoElementsRef.current,
    getPeerConnectionState: (participantId) => {
      const pc = peerConnectionsRef.current[participantId];
      const state = connectionStateRef.current[participantId];
      return {
        exists: !!pc,
        connectionState: pc?.connectionState,
        iceConnectionState: pc?.iceConnectionState,
        retryCount: state?.retryCount || 0,
        useTurn: state?.useTurn || false,
        isConnecting: state?.isConnecting || false,
        consecutiveFailures: state?.consecutiveFailures || 0,
        isInBackoff: !!backoffTimerRef.current[participantId],
        isInCooldown: state?.isInCooldown || false,
        lastSuccessfulAttempt: state?.lastSuccessfulAttempt || 0,
      };
    },
  };
};