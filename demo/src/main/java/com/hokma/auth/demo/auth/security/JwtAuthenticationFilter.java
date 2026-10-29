package com.hokma.auth.demo.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.hokma.auth.demo.auth.repository.UserRepository;
import com.hokma.auth.demo.shared.helper.AppHelper;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        try {
            Jws<Claims> parsed = jwtService.parse(token);

            if (parsed == null) {
                writeUnauthorized(response, request, "Invalid token.");
                return;
            }

            Claims payload = parsed.getPayload();
            Object typ = payload.get("typ");

            if (!"access".equals(typ)) {
                writeUnauthorized(response, request, "Token type is not 'access'.");
                return;
            }

            String userId = payload.getSubject();
            UUID userUuid = AppHelper.parseUUID(userId);

            var userOpt = userRepository.findById(userUuid);
            if (userOpt.isEmpty()) {
                writeUnauthorized(response, request, "User not found.");
                return;
            }

            var user = userOpt.get();

            List<GrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role.getName()))
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            writeUnauthorized(response, request, "Token has expired.");
        } catch (SignatureException e) {
            writeUnauthorized(response, request, "Token signature invalid.");
        } catch (MalformedJwtException e) {
            writeUnauthorized(response, request, "Token malformed.");
        } catch (Exception e) {
            e.printStackTrace(); // Added for debugging
            writeUnauthorized(response, request, "Authentication failed: " + e.getMessage());
        }
    }

    private void writeUnauthorized(HttpServletResponse response, HttpServletRequest request, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 401,
                "error", "Unauthorized",
                "message", message,
                "path", request.getServletPath()
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
