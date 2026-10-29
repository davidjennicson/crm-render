package com.hokma.auth.demo.auth.service.impl;

import com.hokma.auth.demo.auth.dto.AuthResponseDto;
import com.hokma.auth.demo.auth.dto.LoginDto;
import com.hokma.auth.demo.auth.dto.UserDto;
import com.hokma.auth.demo.auth.entity.User;
import com.hokma.auth.demo.auth.repository.UserRepository;
import com.hokma.auth.demo.auth.security.JwtService;
import com.hokma.auth.demo.auth.service.AuthService;
import com.hokma.auth.demo.auth.service.UserService;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public UserDto registerUser(UserDto userDto) {
        if (userDto.getPassword() == null) {
            throw new IllegalArgumentException("Password cannot be null during registration");
        }
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return userService.createUser(userDto);
    }

    @Override
    public AuthResponseDto login(LoginDto loginDto) {
        if (loginDto.getPassword() == null) {
            throw new IllegalArgumentException("Password cannot be null during login");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        return new AuthResponseDto(accessToken, refreshToken);
    }

    @Override
    public AuthResponseDto refreshToken(String refreshToken) {
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        UUID userId = jwtService.getUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);

        return new AuthResponseDto(accessToken, refreshToken);
    }
}
