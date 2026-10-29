package com.hokma.auth.demo.auth.service;

import com.hokma.auth.demo.auth.dto.UserDto;

public interface UserService {
    UserDto createUser(UserDto userDto);
    UserDto getUserByEmail(String email);
    UserDto getUserById(String userId);
    Iterable<UserDto> getAllUsers();
    UserDto updateUser(UserDto userDto, String userId);
    void deleteUser(String userId);
}
