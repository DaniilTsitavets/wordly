package com.wordly.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "oauth")
public class OAuthProperties {

    private Provider google = new Provider();

    public Provider getGoogle() { return google; }
    public void setGoogle(Provider google) { this.google = google; }

    public static class Provider {
        private String clientId;
        private String clientSecret;

        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }

        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    }
}