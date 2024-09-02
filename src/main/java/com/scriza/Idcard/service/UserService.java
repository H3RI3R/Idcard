package com.scriza.Idcard.service;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        logger.info("Login attempt with email: {}", email);

        User user = userRepository.findByEmailAndPassword(email, password);
        if (user != null) {
            logger.info("Successful login for email: {}", email);
            user.setPassword(UUID.randomUUID().toString().substring(0, 8)); // Generate a token and set it as password
            return user;
        }

        logger.error("Invalid email or password for email: {}", email);
        throw new RuntimeException("Invalid email or password");
    }
}
