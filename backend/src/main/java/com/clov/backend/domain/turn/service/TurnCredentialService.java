package com.clov.backend.domain.turn.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * TURN 서버에 사용할 credential(username + HMAC)을 생성하는 서비스입니다.
 */
@Service
public class TurnCredentialService {

    /** HMAC 생성 시 사용할 알고리즘 */
    private static final String HMAC_ALGORITHM = "HmacSHA1";

    /** TURN 서버에서 설정한 realm 값 (turnserver.conf와 동일해야 함) */
    private static final String REALM = "dev.clov.co.kr";

    /** TURN 서버에 설정된 static-auth-secret 값과 동일해야 함 */
    private static final String STATIC_AUTH_SECRET = "96a11c71ddc9d8a5a450d940e825560f";

    /**
     * TURN 서버에서 사용할 username 및 credential을 생성합니다.
     *
     * @param clientId 클라이언트 식별자 (UUID)
     * @param ttlSeconds credential 유효 시간 (초)
     * @return username 및 credential 정보
     */
    public Map<String, String> generateTurnCredentials(UUID clientId, long ttlSeconds) {
        try {
            long unixTime = Instant.now().getEpochSecond() + ttlSeconds;
            String username = unixTime + ":" + clientId;

            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(STATIC_AUTH_SECRET.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] hmac = mac.doFinal(username.getBytes(StandardCharsets.UTF_8));
            String credential = Base64.getEncoder().encodeToString(hmac);

            return Map.of("username", username, "credential", credential);
        } catch (Exception e) {
            throw new RuntimeException("TURN credential 생성 중 오류 발생", e);
        }
    }
}
