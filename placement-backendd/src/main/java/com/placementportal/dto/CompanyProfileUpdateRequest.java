package com.placementportal.dto;

import lombok.Data;

@Data
public class CompanyProfileUpdateRequest {
    private String industry;
    private String website;
    private String description;
}
