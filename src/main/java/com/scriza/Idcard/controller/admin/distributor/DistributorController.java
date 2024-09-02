package com.scriza.Idcard.controller.admin.distributor;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.distributor.ActivityAdmin;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Repository.UserRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.service.admin.distributor.DistributorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/distributor")
public class DistributorController {

    @Autowired
    private DistributorService distributorService;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;

    @GetMapping("/name")
    public ResponseEntity<Map<String, String>> getNameByEmail(@RequestParam String email) {
        try {
            String name = distributorService.getNameByEmail(email);
            Map<String, String> response = new HashMap<>();
            response.put("email", email);
            response.put("name", name);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }



        @PostMapping("/create")
        public Map<String, String> createDistributor(@RequestParam String name,
                                                     @RequestParam String email,
                                                     @RequestParam String password,
                                                     @RequestParam String phoneNumber,
                                                     @RequestParam String creatorEmail,
                                                     @RequestParam String designation,
                                                     @RequestParam String company,
                                                     @RequestParam String address) {
            try {
                User distributor = distributorService.createDistributor(name, email, password, phoneNumber, creatorEmail, designation, company, address);

                // Log activity
                logActivity("DISTRIBUTOR_CREATION", "Created distributor: " + email, creatorEmail);

                Map<String, String> response = new HashMap<>();
                response.put("email", distributor.getEmail());
                response.put("password", distributor.getPassword());
                response.put("message", "Distributor created successfully");
                return response;
            } catch (RuntimeException e) {
                Map<String, String> response = new HashMap<>();
                response.put("error", e.getMessage());
                return response;
            }
        }
    public void logActivity(String type, String description, String adminEmail) {
        ActivityAdmin activity = new ActivityAdmin();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setAdminEmail(adminEmail);
        activityRepositoryAdmin.save(activity);
    }
    @GetMapping("/distributor")
    public List<ActivityDis> getDistributorActivities(@RequestParam String distributorEmail) {
        return activityRepositoryDis.findByUserEmailOrderByTimestampDesc(distributorEmail);
    }
    @GetMapping("/AdminActivity")
    public List<ActivityAdmin> getAdminActivities(@RequestParam String adminEmail) {
        return activityRepositoryAdmin.findByAdminEmailOrderByTimestampDesc(adminEmail);
    }

    @PostMapping("/delete")
    public Map<String, String> deleteDistributor(@RequestParam String email) {
        try {
            distributorService.deleteDistributor(email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Distributor deleted successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }

    @GetMapping("/find")
    public Map<String, Object> findUserDetails(@RequestParam String email,
                                               @RequestParam String requestingUserRole) {
        try {
            Map<String, Object> userDetails = distributorService.findUserDetails(email, requestingUserRole);
            return userDetails;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/userInfo")
    public ResponseEntity<User> getUserInfo(@RequestParam String email) {
        try {
            User user = distributorService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    @GetMapping("/users")
    public ResponseEntity<?> getUsersWithTokenAmounts(@RequestParam String adminEmail) {
        try {
            List<Map<String, Object>> usersWithTokens = distributorService.getUsersWithTokenAmountsIfAdmin(adminEmail);
            return ResponseEntity.ok(usersWithTokens);
        } catch (RuntimeException e) {
            // Handle unauthorized access
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
    @GetMapping("/listWithAdminAccess")
    public Iterable<User> listDistributors(@RequestParam String adminEmail) {
        return distributorService.listDistributors(adminEmail);
    }
    @GetMapping("/list")
    public Iterable<User> listDistributors() {
        return distributorService.listDistributors();
    }
}

