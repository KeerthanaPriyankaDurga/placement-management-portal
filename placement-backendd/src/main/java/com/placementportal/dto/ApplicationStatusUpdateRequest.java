package com.placementportal.dto;

import lombok.Data;

@Data
public class ApplicationStatusUpdateRequest {
    private String status; // "SHORTLISTED" or "REJECTED"
}
