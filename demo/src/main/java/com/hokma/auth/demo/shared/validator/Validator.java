package com.hokma.auth.demo.shared.validator;

public interface Validator<D> {
    void validateForCreate(D dto);
    void validateForUpdate(D dto);
}
