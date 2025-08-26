package com.clov.backend.common.util;

import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.util.Random;
import java.util.UUID;

@Slf4j
public class RandomUtil {

    private static final String CHAR_UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUWXYZ";
    private static final String CHAR_LOWER_CASE = "abcdefghijklmnopqrstuwxyz";
    private static final String CHAR_NUMBERS = "0123456789";

    private static final String ALL_CHARS =  CHAR_UPPER_CASE + CHAR_LOWER_CASE + CHAR_NUMBERS;

    private static final int keyLength = 6;

    public static String generateCode(){
        StringBuilder sb = new StringBuilder();
        Random random = new SecureRandom();
        for(int i = 0; i < keyLength; i++){
            int randomIdx = random.nextInt(ALL_CHARS.length());
            sb.append(ALL_CHARS.charAt(randomIdx));
        }

        //log.info("Random Id 값: {}", sb.toString());
        return sb.toString();
    }
}
