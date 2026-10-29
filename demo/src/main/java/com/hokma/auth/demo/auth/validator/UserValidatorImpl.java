package com.hokma.auth.demo.auth.validator;

import com.hokma.auth.demo.auth.dto.UserDto;
import com.hokma.auth.demo.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserValidatorImpl implements UserValidator {

    private final UserRepository userRepository;

    @Override
    public void validateForCreate(UserDto dto) {
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        validateEmailUniqueness(dto.getEmail());
    }

    @Override
    public void validateForUpdate(UserDto dto) {
        // Additional update validation logic
    }

    @Override
    public void validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
    }
}
