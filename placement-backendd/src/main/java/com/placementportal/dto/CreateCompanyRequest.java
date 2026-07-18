package com.placementportal.dto;

import lombok.Data;

@Data
public class CreateCompanyRequest {
    private String name;
    private String email;
    private String password;
    private String industry;
    private String website;
}
