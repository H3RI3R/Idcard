package com.scriza.Idcard.service.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.Token;
import com.scriza.Idcard.Entity.admin.Token.TokenTransaction;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.distributor.ActivityAdmin;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Entity.admin.retailer.Activity;
import com.scriza.Idcard.Repository.admin.Token.TokenRepository;
import com.scriza.Idcard.Repository.admin.Token.TokenTransactionRepository;
import com.scriza.Idcard.Repository.UserRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Repository.admin.retailer.ActivityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.*;

@Service
public class TokenService {
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;

    @Autowired
    private TokenTransactionRepository tokenTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String DIGITS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    public int getTokenCount(String identifier) {
        // Check if the identifier looks like an email
        if (identifier.contains("@")) {
            // Fetch token by userEmail
            Token token = tokenRepository.findByUserEmail(identifier);
            return (token != null) ? token.getTokenAmount() : 0;
        } else {
            // Check if identifier is a phone number and fetch token by phone number
            Optional<Token> tokenOpt = tokenRepository.findByPhoneNumber(identifier);
            return tokenOpt.map(Token::getTokenAmount).orElse(0);
        }
    }



    public void createToken(String walletAddress, String email, int amount) {
        User user = userRepository.findByEmail(email);
        String transactionId = generateUniqueTransactionId();
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Token token = tokenRepository.findByWalletAddress(walletAddress).orElseGet(() -> {
            Token newToken = new Token();
            newToken.setWalletAddress(walletAddress);
            newToken.setTokenAmount(0);
            return newToken;
        });

        int openingBalance = token.getTokenAmount(); // Balance before token creation
        token.setTokenAmount(openingBalance + amount);
        int closingBalance = token.getTokenAmount(); // Balance after token creation

        logActivityAdmin("TOKEN_CREATION", "Created " + amount + " tokens for " + email, user.getEmail(), transactionId, openingBalance, closingBalance);
        tokenRepository.save(token);
    }
    public void logActivityAdmin(String type, String description, String adminEmail, String transactionId, int openingBalance, int closingBalance) {
        ActivityAdmin activity = new ActivityAdmin();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setAdminEmail(adminEmail);
        activity.setTransactionId(transactionId);
        activity.setOpeningBalance(openingBalance);
        activity.setClosingBalance(closingBalance);
        activityRepositoryAdmin.save(activity);
    }
    public String sendToken(String senderIdentifier, int amount, String recipient) {
        // Determine if senderIdentifier is a phone number or wallet address
        Token senderToken;
        if (senderIdentifier.matches("\\d+")) { // If senderIdentifier contains only digits, assume it's a phone number
            senderToken = tokenRepository.findByPhoneNumber(senderIdentifier)
                    .orElseThrow(() -> new RuntimeException("Sender token not found"));
        } else { // Otherwise, assume it's a wallet address
            senderToken = tokenRepository.findByWalletAddress(senderIdentifier)
                    .orElseThrow(() -> new RuntimeException("Sender token not found"));
        }

        // Fetch the sender's phone number
        String senderPhoneNumber = senderToken.getPhoneNumber();

        // Determine if recipient is a phone number or wallet address
        Token recipientToken;
        if (recipient.matches("\\d+")) { // If the recipient contains only digits, assume it's a phone number
            recipientToken = tokenRepository.findByPhoneNumber(recipient)
                    .orElseThrow(() -> new RuntimeException("Recipient token not found"));
        } else { // Otherwise, assume it's a wallet address
            recipientToken = tokenRepository.findByWalletAddress(recipient)
                    .orElseThrow(() -> new RuntimeException("Recipient token not found"));
        }

        // Get sender and recipient users by their email addresses
        User senderUser = userRepository.findByEmail(senderToken.getUserEmail());
        User recipientUser = userRepository.findByEmail(recipientToken.getUserEmail());

        if (senderUser == null || recipientUser == null) {
            throw new RuntimeException("User not found");
        }

        // Check roles and permissions
        if (senderUser.getRole().equals("ADMIN")) {
            if (!recipientUser.getRole().equals("RETAILER") && !recipientUser.getRole().equals("DISTRIBUTOR")) {
                throw new RuntimeException("Admins can only send tokens to retailers or distributors");
            }
        } else if (senderUser.getRole().equals("DISTRIBUTOR")) {
            if (!recipientUser.getRole().equals("RETAILER")) {
                throw new RuntimeException("Distributors can only send tokens to retailers");
            }

            // Check if the recipient retailer was created by the distributor
            if (!recipientUser.getCreatorEmail().equals(senderToken.getUserEmail())) {
                throw new RuntimeException("This retailer was not created by you.");
            }
        } else {
            throw new RuntimeException("Only admins and distributors can send tokens");
        }

        // Check token balance and perform the transfer
        if (senderToken.getTokenAmount() >= amount) {
            // Deduct tokens from sender
            int senderOpeningBalance = senderToken.getTokenAmount();
            senderToken.setTokenAmount(senderOpeningBalance - amount);
            int senderClosingBalance = senderToken.getTokenAmount();
            tokenRepository.save(senderToken);

            // Add tokens to recipient
            recipientToken.setTokenAmount(recipientToken.getTokenAmount() + amount);
            tokenRepository.save(recipientToken);

            // Generate unique transaction ID
            String transactionId = generateUniqueTransactionId();

            // Record transaction
            TokenTransaction transaction = new TokenTransaction();
            transaction.setTransactionId(transactionId);
            transaction.setSenderWalletAddress(senderToken.getWalletAddress()); // Always set the wallet address
            transaction.setSenderPhoneNumber(senderPhoneNumber); // Set the sender's phone number
            transaction.setRecipientWalletAddress(recipientToken.getWalletAddress());
            transaction.setRecipientPhoneNumber(recipientToken.getPhoneNumber());
            transaction.setAmount(amount);
            transaction.setRecipientType(recipientToken.getPhoneNumber() != null ? "PHONE" : "WALLET");
            transaction.setDescription("Tokens sent to " + (recipientToken.getPhoneNumber() != null ? "phone number " + recipientToken.getPhoneNumber() : "wallet address " + recipientToken.getWalletAddress()));
            transaction.setSenderEmail(senderToken.getUserEmail());
            transaction.setRecipientEmail(recipientToken.getUserEmail());
            transaction.setTransactionDate(new Date());
            tokenTransactionRepository.save(transaction);

            ActivityDis activityDis = new ActivityDis();
            activityDis.setType("TOKEN_SENT");
            activityDis.setDescription("Sent " + amount + " tokens to " + recipient);
            activityDis.setTimestamp(new Date());
            activityDis.setUserEmail(senderToken.getUserEmail());
            activityRepositoryDis.save(activityDis);

            // Log receiving token activity for the recipient
            ActivityDis receiveActivity = new ActivityDis();
            receiveActivity.setType("TOKEN_RECEIPT");
            receiveActivity.setDescription("Received " + amount + " tokens from " + senderIdentifier);
            receiveActivity.setTimestamp(new Date());
            receiveActivity.setUserEmail(recipientToken.getUserEmail());
            activityRepositoryDis.save(receiveActivity);
            logActivityAdmin("TOKEN_SENT", "Sent " + amount + " tokens to " + recipient, senderToken.getUserEmail(), transactionId, senderOpeningBalance, senderClosingBalance);
            // Log activity
            logActivity(
                    "TOKEN_RECEIPT",
                    "Received " + amount + " tokens from " + senderIdentifier,
                    recipientToken.getUserEmail()
            );

            return transactionId;
        } else {
            throw new RuntimeException("Insufficient tokens or invalid sender.");
        }
    }public void logActivity(String type, String details, String userEmail) {
        Activity activity = new Activity();
        activity.setType(type);
        activity.setDetails(details);
        activity.setTimestamp(new java.util.Date().toString());
        activity.setUserEmail(userEmail);

        activityRepository.save(activity);
    }
    public TokenTransaction viewTransactionById(String transactionId) {
        // Fetch the transaction by ID from the repository
        return tokenTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction with ID " + transactionId + " not found"));
    }

    public int getTotalTokensTransferred(String senderIdentifier) {
        List<TokenTransaction> transactions = tokenTransactionRepository.findBySenderWalletAddressOrSenderPhoneNumber(senderIdentifier, senderIdentifier);
        return transactions.stream().mapToInt(TokenTransaction::getAmount).sum();
    }

    public Iterable<TokenTransaction> viewTokenDistribution() {
        return tokenTransactionRepository.findAll();
    }

    private String generateUniqueTransactionId() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }
    public List<Token> getAllTokens() {
        return tokenRepository.findAll();
    }

    public boolean isAdmin(String email) {
        User user = userRepository.findByEmail(email);
        return user != null && user.getRole().equals("ADMIN");
    }
    public boolean isDistributor(String email) {
        User user = userRepository.findByEmail(email);
        return user != null && user.getRole().equals("DISTRIBUTOR");
    }
    public boolean isAdminOrDistributor(String email) {
        User user = userRepository.findByEmail(email);
        return user != null && (user.getRole().equals("ADMIN") || user.getRole().equals("DISTRIBUTOR"));
    }
    public Map<String, String> getPhoneNumberAndWalletAddressByEmail(String email) {
        Token token = tokenRepository.findByUserEmail(email);

        if (token == null) {
            throw new RuntimeException("Token not found for the given email.");
        }

        // Create a response map with structured data
        Map<String, String> response = new HashMap<>();
        response.put("walletAddress", token.getWalletAddress());
        response.put("phoneNumber", token.getPhoneNumber());

        return response;
    }
    public List<TokenTransaction> getTransactionsByEmail(String email) {
        List<TokenTransaction> receivedTransactions = tokenTransactionRepository.findByRecipientEmail(email);
        List<TokenTransaction> sentTransactions = tokenTransactionRepository.findBySenderEmail(email);

        // Combine both lists
        receivedTransactions.addAll(sentTransactions);

        return receivedTransactions;
    }

}
