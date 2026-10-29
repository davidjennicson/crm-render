package com.hokma.auth.demo.auth.validator;

import com.hokma.auth.demo.auth.dto.UserDto;
import com.hokma.auth.demo.shared.validator.Validator;

public interface UserValidator extends Validator<UserDto> {
    void validateEmailUniqueness(String email);
}
