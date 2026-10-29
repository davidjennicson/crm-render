package com.hokma.auth.demo.shared.helper;

import com.hokma.auth.demo.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityHelper {

    /**
     * Get the currently authenticated user from SecurityContext.
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Get the ID of the currently authenticated user.
     */
    public static UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Ensure a user is authenticated and return their ID, otherwise throw an exception.
     */
    public static UUID getAuthenticatedUserId() {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userId;
    }
}
