package com.placementportal.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class JobRequest {
    private String title;
    private String description;
    private String location;
    private String packageOffers;
    private Boolean active;
    private LocalDate expiryDate; // optional
}
