package com.placementportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String packageOffers;
    private boolean active;
    private LocalDateTime postedAt;
    private LocalDate expiryDate;
    private boolean expired;
    private Long companyId;
    private String companyName;
    private long applicantsCount;
    private boolean appliedByCurrentUser;
    private boolean savedByCurrentUser;
}
