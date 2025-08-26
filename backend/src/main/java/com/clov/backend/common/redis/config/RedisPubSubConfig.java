package com.clov.backend.common.redis.config;

import com.clov.backend.common.redis.RedisExpirationListener;
import com.clov.backend.common.redis.RedisSubscriber;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Redis pub/sub 리스너 설정을 위한 구성 클래스입니다.
 */
@Configuration
@RequiredArgsConstructor
public class RedisPubSubConfig {

    private final RedisConnectionFactory redisConnectionFactory;
    private final RedisSubscriber redisSubscriber;
    private final RedisExpirationListener redisExpirationListener;

    /**
     * Redis 메시지를 비동기로 처리하기 위한 Executor Bean 등록
     */
    @Bean
    public ThreadPoolTaskExecutor redisTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setThreadNamePrefix("redis-listener-");
        executor.initialize();
        return executor;
    }

    /**
     * Redis pub/sub 메시지를 수신하기 위한 RedisMessageListenerContainer 등록
     *
     * @param redisTaskExecutor Redis 메시지 리스너용 스레드 풀
     * @return RedisMessageListenerContainer
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(ThreadPoolTaskExecutor redisTaskExecutor) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);
        container.setTaskExecutor(redisTaskExecutor);
        container.addMessageListener(redisSubscriber, new PatternTopic("room:*")); // room:* 채널 구독
        // TTL 만료 이벤트 수신 구독
        container.addMessageListener(redisExpirationListener, new PatternTopic("__keyevent@0__:expired"));
        return container;
    }
}
