package com.placementportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "job_offers")
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private User company; // User with role COMPANY

    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String location;
    
    @Column(name = "package_offers")
    private String packageOffers; // e.g., "5.0 - 7.5 LPA"
    
    @Column(name = "posted_at")
    private LocalDateTime postedAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean active = true;

    // Optional: if set, the job is treated as expired once this date has passed,
    // regardless of the 'active' flag (companies can still close it manually via 'active' too).
    private LocalDate expiryDate;
}
