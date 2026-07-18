package com.placementportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String department;
    private Double cgpa;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String status;
    private LocalDateTime appliedAt;

    private LocalDate interviewDate;
    private String interviewTime;
    private String interviewVenue;
    private String interviewMode;
    private String interviewMeetingLink;
    private String interviewInstructions;

    private boolean offerLetterAvailable;
}
