package com.clov.backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Profile("dev")
@Configuration
public class SwaggerConfig {
    private static final String SECURITY_SCHEME_NAME = "authorization";
    @Bean
    public OpenAPI swaggerApi() {
        return new OpenAPI()
                .servers(List.of(new Server().url("https://dev.clov.co.kr")))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                //우리꺼에 인증은 아직 없지만 이후를 위해 일단 넣어놓음
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .info(new Info()
                        .title("CLOV API")
                        .description("CLOV 프로젝트의 API 문서")
                        .version("v1.0.0"));
    }
}

