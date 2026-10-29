package com.hokma.auth.demo.shared;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards all non-API, non-static-asset routes to the React SPA (index.html)
 * so client-side routing works on direct navigation and page refresh.
 * Also handles /error to prevent Whitelabel Error Page from showing.
 */
@Controller
public class SpaForwardController implements ErrorController {

    @GetMapping(value = {
            "/error",
            "/login", "/signup", "/otp", "/onboarding",
            "/dashboard", "/tasks", "/contacts", "/companies",
            "/deals", "/teams", "/analytics", "/workflows",
            "/messages", "/settings", "/assistant"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
