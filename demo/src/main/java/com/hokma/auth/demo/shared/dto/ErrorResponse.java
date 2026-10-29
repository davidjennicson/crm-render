package com.hokma.auth.demo.shared.dto;

import org.springframework.http.HttpStatus;

public record ErrorResponse(String message,
                            HttpStatus status,
                            int statusCode
                            ) {
}
