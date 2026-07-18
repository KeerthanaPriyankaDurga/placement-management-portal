package com.placementportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileResponse {
    private Long userId;
    private String name;
    private String email;
    private String industry;
    private String website;
    private String description;
    private long activeJobs;
    private boolean approved;
}
