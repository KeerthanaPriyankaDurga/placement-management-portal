package com.placementportal.repository;

import com.placementportal.model.CompanyProfile;
import com.placementportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
    Optional<CompanyProfile> findByUser(User user);
    Optional<CompanyProfile> findByUserId(Long userId);
}
