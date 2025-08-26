package com.clov.backend.common.config;

import com.clov.backend.domain.canvas.dto.CanvasStateDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    /**
     * 기본 RedisTemplate 설정
     * - Key: String 타입
     * - Value: Object 타입 (Jackson 직렬화 사용, 타입 정보 포함)
     * - Hash Key/Value 모두 동일한 직렬화 방식 적용
     *
     * 이 Template은 다양한 타입의 데이터를 Redis에 저장할 수 있으며,
     * 특히 Hash 구조로 Canvas 상태를 저장할 때 사용됩니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory cf) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(cf);

        // Key는 문자열, Value는 JSON 직렬화 (타입 정보 포함)
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        // Hash도 동일하게 설정
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        return template;
    }

    /**
     * 배경 정보 전용 RedisTemplate 설정
     * - Key: String
     * - Value: CanvasStateDto.BackgroundDto (직렬화 타입 고정)
     *
     * 이 Template은 Redis에서 Value 타입으로 저장되는
     * 배경 정보 (canvas:{roomCode}:background)에 대해 사용됩니다.
     */
    @Bean
    public RedisTemplate<String, CanvasStateDto.BackgroundDto> backgroundRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, CanvasStateDto.BackgroundDto> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        return template;
    }
}
