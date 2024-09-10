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

    public void saveBank(String email,
                         String accountNumber,
                         String accountOwnerFullName,
                         String fathersName,
                         String mothersName,
                         String address,
                         String ifscCode,
                         String upiId,
                         String upiName,
                         String upiFathersName,
                         String phoneNumber,
                         String upiProvider,
                         byte[] qrCodeBytes) {

        Bank bank = new Bank();
        bank.setEmail(email);

        // If saving account details
        if (accountNumber != null) {
            bank.setIdentifier(accountNumber);  // Account number is the identifier
            bank.setName(accountOwnerFullName); // Account owner's name
            bank.setFathersName(fathersName);
            bank.setMothersName(mothersName);
            bank.setAddress(address);
            bank.setIfscCode(ifscCode);
        }

        // If saving UPI details
        if (upiId != null) {
            bank.setIdentifier(upiId);  // UPI ID is the identifier
            bank.setName(upiName);      // Account name
            bank.setFathersName(upiFathersName);
            bank.setPhoneNumber(phoneNumber);
            bank.setUpiProvider(upiProvider);
            bank.setQrCode(qrCodeBytes); // Save the QR Code binary data
        }

        bankRepository.save(bank);
    }
    @Transactional
    public void modifyBank(String email, String identifier, String changeIdentifier, String changeName) {
        // Find the bank by identifier and email
        Bank bank = bankRepository.findByIdentifier(identifier);

        if (bank == null || !bank.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bank not found for email: " + email + " and identifier: " + identifier);
        }

        // Initialize variables to track what was updated
        StringBuilder updateDetails = new StringBuilder();

        // If changeIdentifier is provided, update the identifier
        if (changeIdentifier != null && !changeIdentifier.isEmpty()) {
            if (changeIdentifier.contains("@")) {
                bank.setIdentifier(changeIdentifier);  // It's a UPI ID
                updateDetails.append("UPI ID");
            } else if (changeIdentifier.matches("\\d+")) {
                bank.setIdentifier(changeIdentifier);  // It's an Account Number
                updateDetails.append("Account Number");
            } else {
                throw new IllegalArgumentException("Invalid identifier format");
            }
        }

        // If changeName is provided, update the name
        if (changeName != null && !changeName.isEmpty()) {
            bank.setName(changeName);
            if (updateDetails.length() > 0) {
                updateDetails.append(" and ");  // Append 'and' if both were changed
            }
            updateDetails.append("Name");
        }

        // If nothing was updated, throw an exception
        if (updateDetails.length() == 0) {
            throw new RuntimeException("No valid fields to update");
        }

        // Save the updated bank record
        bankRepository.save(bank);

        // Log the activity
        String activityDescription = "Updated bank for email: " + email + " with new " + updateDetails;
        logActivityDis(bank.getEmail(), activityDescription, updateDetails.toString());
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