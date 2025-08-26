package com.clov.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class AwsConfig {

    @Bean
    public S3Presigner s3Presigner(
            @Value("${cloud.aws.region}") String region,
            @Value("${cloud.aws.credentials.access-key}") String accessKey,
            @Value("${cloud.aws.credentials.secret-key}") String secretKey) {

        AwsCredentialsProvider provider;

        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            // (b) 방식: yml에 직접 키를 넣은 경우
            provider = StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey));
        } else {
            // 환경변수 / ~/.aws/credentials / EC2 Role 등 기본 탐색
            provider = DefaultCredentialsProvider.create();
        }

        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(provider)
                .build();
    }
}