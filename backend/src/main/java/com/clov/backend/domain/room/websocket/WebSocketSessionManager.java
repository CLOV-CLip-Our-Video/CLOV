package com.clov.backend.domain.room.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 방별로 WebSocketSession을 관리하고 브로드캐스트 및 단일 전송을 처리하는 유틸리티 클래스입니다.
 */
@Slf4j
@Component
public class WebSocketSessionManager {

    // roomCode별 세션 리스트
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // clientId → WebSocketSession 매핑
    private final Map<String, WebSocketSession> clientSessionMap = new ConcurrentHashMap<>();

    /**
     * 새로운 세션을 등록합니다. roomCode와 clientId를 URI 쿼리에서 추출하여 저장합니다.
     * @param session WebSocket 세션
     */
    public void registerSession(WebSocketSession session) {
        String roomCode = getRoomCodeFromSession(session);
        String clientId = getClientIdFromSession(session);

        roomSessions.computeIfAbsent(roomCode, k -> ConcurrentHashMap.newKeySet()).add(session);
        clientSessionMap.put(clientId, session);

        //log.info("[SessionManager] 세션 등록: sessionId={}, roomCode={}, clientId={}", session.getId(), roomCode, clientId);
    }

    /**
     * 세션을 제거하고 관련된 clientId 매핑도 제거합니다.
     * @param session 제거할 세션
     */
    public void removeSession(WebSocketSession session) {
        roomSessions.forEach((roomCode, sessions) -> {
            if (sessions.remove(session)) {
                //log.info("[SessionManager] 세션 제거: {} → roomCode={}", session.getId(), roomCode);
            }
        });

        clientSessionMap.entrySet().removeIf(entry -> entry.getValue().equals(session));
    }

    /**
     * 해당 roomCode에 연결된 모든 세션에 메시지를 브로드캐스트합니다.
     * @param roomCode 방 코드
     * @param message 전송할 메시지
     */
    public void broadcast(String roomCode, String message) {
        Set<WebSocketSession> sessions = roomSessions.get(roomCode);
        if (sessions != null) {
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(new TextMessage(message));
                    } catch (Exception e) {
                        //log.warn("[SessionManager] 메시지 전송 실패: {}", session.getId(), e);
                    }
                }
            }
        }
    }

    /**
     * 특정 clientId에 해당하는 세션으로 단일 메시지를 전송합니다.
     * @param targetClientId 메시지를 보낼 대상 clientId
     * @param message JSON 문자열 메시지
     */
    public void sendToClient(String targetClientId, String message) {
        WebSocketSession session = clientSessionMap.get(targetClientId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (Exception e) {
                //log.warn("[SessionManager] sendToClient 전송 실패: {}", targetClientId, e);
            }
        } else {
            //log.warn("[SessionManager] 세션이 존재하지 않거나 닫힘: {}", targetClientId);
        }
    }

    /**
     * URI 쿼리에서 roomCode를 추출합니다.
     */
    public String getRoomCodeFromSession(WebSocketSession session) {
        String uri = Objects.requireNonNull(session.getUri()).toString();
        String[] parts = uri.split("[?&]");
        for (String part : parts) {
            if (part.startsWith("roomCode=")) {
                return part.substring("roomCode=".length());
            }
        }
        throw new IllegalArgumentException("roomCode가 URI에 포함되어야 합니다.");
    }

    /**
     * URI 쿼리에서 clientId를 추출합니다.
     */
    public String getClientIdFromSession(WebSocketSession session) {
        String uri = Objects.requireNonNull(session.getUri()).toString();
        String[] parts = uri.split("[?&]");
        for (String part : parts) {
            if (part.startsWith("clientId=")) {
                return part.substring("clientId=".length());
            }
        }
        throw new IllegalArgumentException("clientId가 URI에 포함되어야 합니다.");
    }

    /**
     * 해당 roomCode에 연결된 WebSocket 세션이 하나 이상 존재하는지 확인합니다.
     * @param roomCode 방 코드
     * @return 세션 존재 여부
     */
    public boolean hasSubscribers(String roomCode) {
        var sessions = roomSessions.get(roomCode);
        return sessions != null && !sessions.isEmpty();
    }
}
