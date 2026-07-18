package com.placementportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalStudents;
    private long approvedStudents;
    private long pendingStudents;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long placedStudents;
    private double placementRate; // percentage of approved students who are placed
}
