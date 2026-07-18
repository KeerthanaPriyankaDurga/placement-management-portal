package com.placementportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String department;
    private String batch;
    
    @Column(nullable = false)
    private Double cgpa = 0.0;
    
    private String skills;

    // Filename as stored on disk (unique, safe name)
    private String resumeFileName;

    // Original filename the student uploaded, shown back to them/companies/admin
    private String resumeOriginalName;
}
