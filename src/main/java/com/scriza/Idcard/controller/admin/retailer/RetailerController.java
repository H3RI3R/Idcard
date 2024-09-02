package com.scriza.Idcard.controller.admin.retailer;

import com.scriza.Idcard.Entity.IdCard;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.retailer.Activity;
import com.scriza.Idcard.UserWithToken;
import com.scriza.Idcard.service.admin.retailer.RetailerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/retailer")
public class RetailerController {

    @Autowired
    private RetailerService retailerService;
    @PostMapping("/create")
    public Map<String, String> createRetailer(@RequestParam String name,
                                              @RequestParam String email,
                                              @RequestParam String password,
                                              @RequestParam String company,
                                              @RequestParam String phoneNumber,
                                              @RequestParam String companyAddress,
                                              @RequestParam String designation,
                                              @RequestParam String creatorEmail) { // Add creatorEmail parameter
        try {
            User retailer = retailerService.createRetailer(name, email, password, company, phoneNumber, companyAddress, designation, creatorEmail);
            Map<String, String> response = new HashMap<>();
            response.put("email", retailer.getEmail());
            response.put("password", retailer.getPassword());
            response.put("message", "Retailer created successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/listAllRetailer")
    public ResponseEntity<?> listRetailers(@RequestParam String adminEmail) {
        // Retrieve the user by email
        User adminUser = retailerService.getUserByEmail(adminEmail);

        // Check if the user has the "ADMIN" role
        if (adminUser != null && "ADMIN".equalsIgnoreCase(adminUser.getRole())) {
            List<UserWithToken> retailers = retailerService.getAllRetailersWithTokens();
            return ResponseEntity.ok(retailers);
        } else {
            return ResponseEntity.status(401).body("Unauthorized access");
        }
    }
    @PostMapping("/delete")
    public Map<String, String> deleteRetailer(@RequestParam String email, @RequestParam String creatorEmail , @RequestParam String requestingUserRole) {
        try {
            retailerService.deleteRetailer(email, creatorEmail,requestingUserRole);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Retailer deleted successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/user-role")
    public Map<String, String> getUserRole(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        try {
            String role = retailerService.getUserRole(email);
            response.put("role", role);
            return response;
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/list-by-creator")
    public Map<String, Object> listRetailersByCreator(@RequestParam String creatorEmail) {
        try {
            List<User> retailers = retailerService.listRetailersByCreator(creatorEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("retailers", retailers);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }

    @GetMapping("/list")
    public Iterable<User> listRetailer() {
        return retailerService.listRetailer();
    }
    @PostMapping("/create-idcard")
    public ResponseEntity<Map<String, Object>> createIdCard(
            @RequestParam String retailerEmail,
            @RequestParam String name,
            @RequestParam String businessName,
            @RequestParam String businessAddress,
            @RequestParam String phoneNumber,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam String emailAddress,
            @RequestParam String permanentAddress,
            @RequestParam String currentAddress
    ) throws IOException {
        Map<String, Object> response = new HashMap<>();
        try {
            IdCard idCard = retailerService.createIdCard(
                    retailerEmail, name, businessName, businessAddress, phoneNumber,
                    photo, emailAddress, permanentAddress, currentAddress
            );

            // Generate PDF and save to specified location


            response.put("message", "ID card created ");
            response.put("idCard", idCard);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    @PostMapping("/validate-image")
    public ResponseEntity<String> validateImage(@RequestParam("photo") MultipartFile photo) {
        try {
            if (photo.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty.");
            }

            // Create a temporary file
            File tempFile = File.createTempFile("validate", ".png");
            photo.transferTo(tempFile);

            // Check if the image can be read
            BufferedImage testImage = ImageIO.read(tempFile);
            if (testImage == null) {
                return ResponseEntity.badRequest().body("Uploaded file is not a valid image.");
            }

            return ResponseEntity.ok("Image validated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error validating the image file: " + e.getMessage());
        }
    }
    @GetMapping("/idcard")
    public Map<String, Object> findIdCardByIdOrEmail(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String email) {
        try {
            List<IdCard> idCards = retailerService.findIdCardByIdOrEmail(id, email);
            Map<String, Object> response = new HashMap<>();
            response.put("idCards", idCards);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/recent-activities")
    public List<Activity> getRecentActivities(@RequestParam String userEmail) {
        return retailerService.getRecentActivities(userEmail);
    }

    @GetMapping("/idcard-history")
    public Map<String, Object> getIdCardHistory(@RequestParam String retailerEmail) {
        try {
            List<IdCard> idCardHistory = retailerService.getIdCardHistory(retailerEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("idCardHistory", idCardHistory);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }


    }



