package com.clov.backend.domain.background.controller;

import com.clov.backend.common.response.ApiResponseDto;
import com.clov.backend.common.response.ErrorCode;
import com.clov.backend.common.response.SuccessCode;
import com.clov.backend.domain.background.dto.request.ChangeBackgroundRequest;
import com.clov.backend.domain.background.dto.request.AIGenerateRequest; // 새로 추가
import com.clov.backend.domain.background.dto.response.BackgroundListResponse;
import com.clov.backend.domain.background.dto.response.BackgroundResponse;
import com.clov.backend.domain.background.dto.response.UploadBackgroundResponse;
import com.clov.backend.domain.background.service.BackgroundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * 공용 / 방별 배경 관련 API
 * BASE URL : /api/v1/backgrounds
 */
@RestController
@RequestMapping("/api/v1/backgrounds")
@RequiredArgsConstructor
@Slf4j
public class BackgroundController {

    private final BackgroundService backgroundService;
    private final RestTemplate restTemplate; // 추가

    // FastAPI AI 서버 URL
    private static final String AI_SERVER_URL = "ai-server-url";

    /* ---------------- 공용 배경 목록 ---------------- */
    @GetMapping
    public ApiResponseDto<BackgroundListResponse> getBackgrounds() {
        //log.debug("배경 목록 조회");
        BackgroundListResponse data = backgroundService.getBackgrounds();
        return ApiResponseDto.success(SuccessCode.BACKGROUND_GET_SUCCESS, data);
    }

    /* ---------------- AI 배경 생성 ---------------- */
    @PostMapping("/ai/generate")
    public ResponseEntity<byte[]> generateAIBackground(@RequestBody AIGenerateRequest request) {
        try {
            //log.info("AI 배경 생성 요청 - 프롬프트: '{}', 크기: {}x{}",
                    // request.getPrompt(), request.getWidth(), request.getHeight());

            // 입력 검증
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                //log.warn("프롬프트가 비어있음");
                return ResponseEntity.badRequest()
                        .header("X-Error-Message", "프롬프트를 입력해주세요")
                        .build();
            }

            // 기본값 설정
            if (request.getWidth() == null) request = AIGenerateRequest.builder()
                    .prompt(request.getPrompt())
                    .width(512)
                    .height(request.getHeight())
                    .build();
            if (request.getHeight() == null) request = AIGenerateRequest.builder()
                    .prompt(request.getPrompt())
                    .width(request.getWidth())
                    .height(512)
                    .build();

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 요청 본문 생성
            HttpEntity<AIGenerateRequest> entity = new HttpEntity<>(request, headers);

            // FastAPI 서버로 프록시 요청
            //log.debug("FastAPI 서버로 요청 전송: {}", AI_SERVER_URL);
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    AI_SERVER_URL,
                    HttpMethod.POST,
                    entity,
                    byte[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                //log.info("AI 배경 생성 성공 - 이미지 크기: {} bytes", response.getBody().length);

                // 응답 헤더 설정
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.setContentType(MediaType.IMAGE_PNG);
                responseHeaders.setContentLength(response.getBody().length);
                responseHeaders.setCacheControl(CacheControl.noCache());
                responseHeaders.add("X-Generated-Prompt", request.getPrompt()); // 프롬프트 정보 추가

                return new ResponseEntity<>(response.getBody(), responseHeaders, HttpStatus.OK);
            } else {
                //log.error("AI 서버 응답 오류 - 상태 코드: {}", response.getStatusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .header("X-Error-Message", "AI 서버에서 이미지 생성에 실패했습니다")
                        .build();
            }

        } catch (ResourceAccessException e) {
            //log.error("AI 서버 연결 실패 - URL: {}, 에러: {}", AI_SERVER_URL, e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .header("X-Error-Message", "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.")
                    .build();

        } catch (Exception e) {
            //log.error("AI 배경 생성 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", "이미지 생성 중 오류가 발생했습니다")
                    .build();
        }
    }

    /* ---------------- AI 서버 상태 확인 ---------------- */
    @GetMapping("/ai/health")
    public ApiResponseDto<Map<String, Object>> checkAIServerHealth() {
        try {
            // 간단한 헬스체크 (AI 서버에 헬스체크 엔드포인트가 있다면)
            String healthUrl = AI_SERVER_URL.replace("/generate", "/health");
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);

            Map<String, Object> result = new HashMap<>();
            result.put("ai_server_status", "UP");
            result.put("ai_server_url", AI_SERVER_URL);
            result.put("response_code", response.getStatusCode().value());
            result.put("message", "AI 서버가 정상적으로 작동중입니다");

            //log.info("AI 서버 상태 확인 - 정상");
            return ApiResponseDto.success(SuccessCode.BACKGROUND_GET_SUCCESS, result);

        } catch (Exception e) {
            //log.warn("AI 서버 상태 확인 실패: {}", e.getMessage());

            Map<String, Object> result = new HashMap<>();
            result.put("ai_server_status", "DOWN");
            result.put("ai_server_url", AI_SERVER_URL);
            result.put("error", e.getMessage());
            result.put("message", "AI 서버에 연결할 수 없습니다");

            // error 메소드 대신 success로 변경하고 에러 정보는 data에 포함
            return ApiResponseDto.success(SuccessCode.BACKGROUND_GET_SUCCESS, result);
        }
    }
}