package com.hokma.auth.demo.shared.helper;

import java.util.UUID;

public class AppHelper {
    public static UUID parseUUID(String uuid) {
        try {
            return UUID.fromString(uuid);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format: " + uuid);
        }
    }
}
