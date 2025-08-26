package com.clov.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
@AllArgsConstructor
public enum ErrorCode {
    //400 BAD REQUEST
    BAD_REQUEST(400, HttpStatus.BAD_REQUEST, "잘못된 접근입니다."),
    ROOM_CODE_EXPIRED(400, HttpStatus.BAD_REQUEST, "방 코드가 만료되었습니다."),
    MAX_PARTICIPANTS(400, HttpStatus.BAD_REQUEST, "방의 인원이 다 찼습니다."),
    NOT_HOST(400, HttpStatus.BAD_REQUEST, "호스트가 아닙니다."),
    BAD_WORD_NICKNAME(400, HttpStatus.BAD_REQUEST, "비속어가 포함된 닉네임입니다."),

    //404 NOT FOUND
    NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 API를 찾을 수 없습니다."),
    ROOM_NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 방을 찾을 수 없습니다."),
    //405 METHOD NOT ALLOWED
    METHOD_NOT_ALLOWED(405, HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 메소드입니다."),

    //429 TOO MANY REQUESTS
    TOO_MANY_REQUESTS(429, HttpStatus.TOO_MANY_REQUESTS, "요청 횟수를 초과하였습니다."),

    //500 INTERNAL SERVER ERROR
    INTERNAL_SERVER_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다.");


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
