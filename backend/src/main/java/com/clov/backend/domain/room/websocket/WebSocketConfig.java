package com.clov.backend.domain.room.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final RoomStateWebSocketHandler roomStateWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(roomStateWebSocketHandler, "/ws")
                .setAllowedOrigins("https://clov.co.kr","https://dev.clov.co.kr","http://localhost:5173");
    }
}