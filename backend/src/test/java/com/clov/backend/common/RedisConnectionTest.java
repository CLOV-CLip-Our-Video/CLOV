package com.clov.backend.common;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
public class RedisConnectionTest {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Test
    public void testRedisSetAndGet() {
        // Redis에 key-value 저장
        redisTemplate.opsForValue().set("testKey", "hello Redis!");

        // 값 읽기
        String value = (String) redisTemplate.opsForValue().get("testKey");

        // 콘솔 출력
        System.out.println("Redis에 저장된 값: " + value);

        // 검증
        assert value != null && value.equals("hello Redis!");
    }
}