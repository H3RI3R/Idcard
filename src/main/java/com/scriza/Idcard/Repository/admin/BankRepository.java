package com.scriza.Idcard.Repository.admin;

import com.scriza.Idcard.Entity.admin.Bank;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BankRepository extends JpaRepository<Bank, Integer> {

    // Find all banks associated with a specific email
    List<Bank> findAllByEmail(String email);

    @Modifying
    @Query("UPDATE Bank b SET b.identifier = :changeIdentifier WHERE LOWER(b.email) = LOWER(:email) AND b.identifier = :identifier")
    void updateBankByEmailAndIdentifier(@Param("email") String email, @Param("identifier") String identifier, @Param("changeIdentifier") String changeIdentifier);

    @Modifying
    @Query("UPDATE Bank b SET b.name = :changeIdentifier WHERE LOWER(b.email) = LOWER(:email) AND b.identifier = :identifier")
    void updateBankNameByEmailAndIdentifier(@Param("email") String email, @Param("identifier") String identifier, @Param("changeIdentifier") String changeIdentifier);

    @Modifying
    @Query("UPDATE Bank b SET b.identifier = :changeIdentifier WHERE LOWER(b.email) = LOWER(:email) AND b.identifier = :identifier")
    void updateBankIdentifier(@Param("email") String email, @Param("identifier") String identifier, @Param("changeIdentifier") String changeIdentifier);

//    void deleteByEmailAndIdentifier(String email, String identifier);

    Bank findByIdentifier(String identifier);

    Bank findByEmailAndIdentifier(String email, String identifier);

    // Delete the bank entry by email and identifier
    @Modifying
    @Transactional
    void deleteByEmailAndIdentifier(String email, String identifier);
}