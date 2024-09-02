package com.scriza.Idcard.controller;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String email,
                                     @RequestParam String password) {
        try {
            User user = userService.login(email, password);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Successful login");
            response.put("token", user.getPassword()); // The token was set as password in UserService
            response.put("role", user.getRole());
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
}
