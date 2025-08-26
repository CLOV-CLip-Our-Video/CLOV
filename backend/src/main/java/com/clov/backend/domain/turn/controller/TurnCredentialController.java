package com.clov.backend.domain.turn.controller;

import com.clov.backend.common.response.ApiResponseDto;
import com.clov.backend.common.response.SuccessCode;
import com.clov.backend.domain.turn.dto.TurnCredentialResponse;
import com.clov.backend.domain.turn.service.TurnCredentialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * TURN 서버 credential(username + credential)을 발급하는 API 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/turn")
@RequiredArgsConstructor
@Tag(name = "TURN", description = "TURN 서버 관련 API")
public class TurnCredentialController {

    private final TurnCredentialService turnCredentialService;

    /**
     * TURN 연결에 사용할 username, credential 정보를 반환합니다.
     *
     * @param clientId 클라이언트 식별자 (UUID)
     * @return TURN credential 정보 (username + credential)
     */
    @Operation(
            summary = "TURN credential 발급",
            description = "TURN 서버 연결을 위한 username, credential을 발급합니다."
    )
    @GetMapping("/credentials")
    public ApiResponseDto<TurnCredentialResponse> getTurnCredentials(
            @Parameter(
                    description = "클라이언트 식별자 (UUID 형식)",
                    example = "de246ba2-8f3d-4831-b94d-d40705ebbbf2",
                    required = true
            )
            @RequestParam UUID clientId
    ) {
        Map<String, String> credentials = turnCredentialService.generateTurnCredentials(clientId, 3600);
        return ApiResponseDto.success(
                SuccessCode.TURN_CREDENTIAL_ISSUED,
                new TurnCredentialResponse(
                        credentials.get("username"),
                        credentials.get("credential")
                )
        );
    }
}
