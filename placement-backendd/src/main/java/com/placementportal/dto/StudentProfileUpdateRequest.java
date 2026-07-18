package com.placementportal.dto;

import lombok.Data;

@Data
public class StudentProfileUpdateRequest {
    private String department;
    private String batch;
    private Double cgpa;
    private String skills;
}
