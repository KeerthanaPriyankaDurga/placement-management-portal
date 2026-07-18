package com.placementportal.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "STUDENT", "COMPANY"
    
    // Student specific
    private String department;
    private String batch;
}
