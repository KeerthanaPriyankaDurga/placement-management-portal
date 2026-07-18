package com.placementportal.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InterviewScheduleRequest {
    private LocalDate interviewDate;
    private String interviewTime;
    private String interviewVenue;
    private String interviewMode; // "ONLINE" or "OFFLINE"
    private String interviewMeetingLink;
    private String interviewInstructions;
}
