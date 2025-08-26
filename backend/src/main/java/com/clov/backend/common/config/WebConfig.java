package com.clov.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import java.time.Duration;
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해 CORS 허용
                .allowedOrigins("https://clov.co.kr","https://dev.clov.co.kr","http://localhost:5173") // https://clov.co.kr만 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // 허용 HTTP 메서드
                .allowedHeaders("*") // 모든 요청 헤더 허용
                .allowCredentials(false) // 쿠키 등 자격 증명 미사용
                .maxAge(3600); // preflight 결과 캐시 1시간
    }

        /**
         * AI 이미지 생성용 RestTemplate Bean 
         */
        @Bean
        public RestTemplate restTemplate() {
            return new RestTemplate();
        }
}

