package com.hokma.auth.demo.auth.security;

import com.hokma.auth.demo.auth.entity.Provider;
import com.hokma.auth.demo.auth.entity.User;
import com.hokma.auth.demo.auth.repository.UserRepository;
import com.hokma.auth.demo.shared.UserDataSeeder;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;



@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDataSeeder userDataSeeder;
    
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .provider(Provider.GOOGLE)
                    .enable(true)
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        // Seed demo data for this user if they have none yet
        userDataSeeder.seedForUser(user);
        
        // Redirect to the frontend with the tokens
        String targetUrl = frontendUrl + "/login?token=" + accessToken + "&refreshToken=" + refreshToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
