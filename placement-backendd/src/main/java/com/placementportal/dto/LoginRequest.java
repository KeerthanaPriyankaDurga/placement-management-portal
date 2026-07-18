package com.placementportal.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private String role; // Just for double checking on frontend if needed, though email is unique
}
