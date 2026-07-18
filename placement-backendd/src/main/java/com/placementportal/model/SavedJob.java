package com.placementportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "saved_jobs", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "job_id"}))
public class SavedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private JobOffer job;

    private LocalDateTime savedAt = LocalDateTime.now();
}
