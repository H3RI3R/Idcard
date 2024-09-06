package com.scriza.Idcard.service.admin;

import com.scriza.Idcard.Entity.admin.Bank;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Repository.admin.BankRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BankService {

    private static final Logger log = LoggerFactory.getLogger(BankService.class);
    @Autowired
    private BankRepository bankRepository;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;

    public void saveBank(String email, String identifier, String name) {
        Bank bank = new Bank();
        bank.setEmail(email);
        bank.setIdentifier(identifier);
        bank.setName(name);
        bankRepository.save(bank);
    }
    @Transactional
    public void modifyBank(String email, String identifier, String changeIdentifier) {
        // Find the bank by identifier and email
        Bank bank = bankRepository.findByIdentifier(identifier);

        if (bank == null || !bank.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bank not found for email: " + email + " and identifier: " + identifier);
        }

        // Determine the type of changeIdentifier
        String updateType = "";
        if (changeIdentifier.contains("@")) {
            updateType = "UPI ID";
            bank.setIdentifier(changeIdentifier);
        } else if (changeIdentifier.matches("\\d+")) {
            updateType = "Account Number";
            bank.setIdentifier(changeIdentifier);
        } else {
            updateType = "Name";
            bank.setName(changeIdentifier);
        }

        // Save the updated bank
        bankRepository.save(bank);

        // Log the activity
        String activityDescription = "Updated bank for email: " + email + " with new " + updateType + ": " + changeIdentifier;
        logActivityDis(bank.getEmail(), activityDescription, updateType);
    }

    @Transactional
    public void deleteBank(String email, String identifier) {
        // Check if the record exists before attempting deletion
        Bank bank = bankRepository.findByEmailAndIdentifier(email, identifier);
        if (bank == null) {
            throw new RuntimeException("Bank record not found for email: " + email + " and identifier: " + identifier);
        }

        // Perform the deletion
        bankRepository.deleteByEmailAndIdentifier(email, identifier);
    }

    public List<Bank> getBanksByEmail(String email) {
        return bankRepository.findAllByEmail(email);
    }
    public void logActivityDis(String type, String description, String userEmail) {
        ActivityDis activity = new ActivityDis();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setUserEmail(userEmail);
        activityRepositoryDis.save(activity);
    }
}