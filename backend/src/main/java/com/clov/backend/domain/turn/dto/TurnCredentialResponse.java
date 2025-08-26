package com.clov.backend.domain.turn.dto;

/**
 * TURN 서버 연결을 위한 credential 응답 DTO입니다.
 * @param username username (timestamp:userId 형식)
 * @param credential HMAC 기반 인증 토큰
 */
public record TurnCredentialResponse(
        String username,
        String credential
) {}
