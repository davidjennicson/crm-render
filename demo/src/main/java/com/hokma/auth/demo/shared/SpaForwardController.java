package com.hokma.auth.demo.shared;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards all non-API, non-static-asset routes to the React SPA (index.html)
 * so client-side routing works on direct navigation and page refresh.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/login", "/signup", "/otp", "/onboarding",
            "/dashboard", "/tasks", "/contacts", "/companies",
            "/deals", "/teams", "/analytics", "/workflows",
            "/messages", "/settings", "/assistant"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
