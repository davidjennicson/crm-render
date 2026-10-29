package com.hokma.auth.demo.auth.service;

import com.hokma.auth.demo.auth.dto.AuthResponseDto;
import com.hokma.auth.demo.auth.dto.LoginDto;
import com.hokma.auth.demo.auth.dto.UserDto;

public interface AuthService {
    UserDto registerUser(UserDto userDto);
    AuthResponseDto login(LoginDto loginDto);
    AuthResponseDto refreshToken(String refreshToken);
}
