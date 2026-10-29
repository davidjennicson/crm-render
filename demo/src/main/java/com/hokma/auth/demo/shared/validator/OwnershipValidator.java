package com.hokma.auth.demo.shared.validator;

import java.util.UUID;

public interface OwnershipValidator<E> {
    void validateOwnership(E entity, UUID userId);
}
