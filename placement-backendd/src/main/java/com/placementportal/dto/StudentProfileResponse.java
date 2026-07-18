package com.placementportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {
    private Long userId;
    private String name;
    private String email;
    private String department;
    private String batch;
    private Double cgpa;
    private String skills;
    private String resumeOriginalName; // null if no resume uploaded yet
    private int profileCompletion; // 0-100
}
