package com.scriza.Idcard.controller.admin;

import com.scriza.Idcard.Entity.admin.Bank;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Repository.admin.BankRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Response;
import com.scriza.Idcard.service.admin.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/admin/bank")
public class BankController {

    @Autowired
    private BankService bankService;

    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;

    @PostMapping("/save")
    public ResponseEntity<String> saveBank(
            @RequestParam String email,
            @RequestParam String identifier,
            @RequestParam String name) {
        try {
            bankService.saveBank(email, identifier, name);

            // Log the activity for saving a bank
            logActivityDis(identifier.contains("@") ? "UPI_ID" : "ACCOUNT_NUMBER",
                    "Saved " + (identifier.contains("@") ? "UPI ID" : "Account Number"),
                    email);

            return ResponseEntity.ok("Bank saved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
    @PutMapping("/modify")
    public ResponseEntity<?> modifyBank(
            @RequestParam String email,
            @RequestParam String identifier,
            @RequestParam String changeIdentifier) {
        try {
            bankService.modifyBank(email, identifier, changeIdentifier);
            return Response.responseSuccess("Bank Modified Successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteBank(
            @RequestParam String email,
            @RequestParam String identifier) {
        try {
            bankService.deleteBank(email, identifier);

            // Log the activity for deleting a bank
            logActivityDis(identifier.contains("@") ? "UPI_ID" : "ACCOUNT_NUMBER",
                    "Deleted " + (identifier.contains("@") ? "UPI ID" : "Account Number"),
                    email);

            return ResponseEntity.ok("Bank deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/view")
    public ResponseEntity<List<Bank>> viewBanks(@RequestParam String email) {
        try {
            List<Bank> banks = bankService.getBanksByEmail(email);
            return ResponseEntity.ok(banks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Activity logging method
    public void logActivityDis(String type, String description, String userEmail) {
        ActivityDis activity = new ActivityDis();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setUserEmail(userEmail);
        activityRepositoryDis.save(activity);
    }
}