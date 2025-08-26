package com.clov.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SuccessCode {

    //200 OK
    BACKGROUND_GET_SUCCESS(200,HttpStatus.OK,"배경 목록이 로드되었습니다."),
    BACKGROUND_CHANGE_SUCCESS(200,HttpStatus.OK,"배경이 변경되었습니다."),
    MEDIA_UPLOAD_SUCCESS(200,HttpStatus.OK,"서버에 성공적으로 저장되었습니다."),
    ROOM_CHECK_SUCCESS(200, HttpStatus.OK, "유효한 방 코드입니다."),
    // 캔버스 관련
    CANVAS_UPDATE_SUCCESS(200, HttpStatus.OK, "캔버스 상태가 갱신되었습니다."),
    CANVAS_GET_SUCCESS(200, HttpStatus.OK, "캔버스 상태가 조회되었습니다."),

    ROOM_LEAVE_SUCCESS(200, HttpStatus.OK, "방에서 나갔습니다."),
    ROOM_PARTICIPANTS_GET_SUCCESS(200, HttpStatus.OK, "방 참여자 목록이 조회되었습니다."),
    ROOM_HOST_CHANGE_SUCCESS(200, HttpStatus.OK, "방장이 정상적으로 바뀌었습니다."),

    TURN_CREDENTIAL_ISSUED(200, HttpStatus.OK, "TURN credential이 발급되었습니다."),
    //201 CREATED
    ROOM_CREATE_SUCCESS(201, HttpStatus.CREATED, "방이 생성되었습니다."),
    UPLOAD_URL_CREATED(201,HttpStatus.CREATED , "업로드 경로가 생성되었습니다."),
    ROOM_ENTER_SUCCESS(201, HttpStatus.CREATED, "사용자가 정상적으로 방에 접속했습니다.")
    ;


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
