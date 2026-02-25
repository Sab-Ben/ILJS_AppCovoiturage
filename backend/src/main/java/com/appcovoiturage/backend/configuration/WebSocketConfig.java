package com.appcovoiturage.backend.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // endpoint websocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // messages envoyés par le client vers le serveur
        registry.setApplicationDestinationPrefixes("/app");

        // broker simple pour diffusion
        registry.enableSimpleBroker("/topic", "/queue");

        // destination user : /user/queue/...
        registry.setUserDestinationPrefix("/user");
    }
}