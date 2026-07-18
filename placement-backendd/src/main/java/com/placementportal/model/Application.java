package com.placementportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student; // User with role STUDENT

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private JobOffer job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt = LocalDateTime.now();

    // ---- Interview scheduling (set by the company, nullable until scheduled) ----
    private LocalDate interviewDate;
    private String interviewTime;   // stored as free text e.g. "10:30 AM" to keep this simple
    private String interviewVenue;
    private String interviewMode;   // "ONLINE" or "OFFLINE"
    private String interviewMeetingLink;

    @Column(columnDefinition = "TEXT")
    private String interviewInstructions;

    // ---- Offer letter (uploaded by the company once a student is SELECTED) ----
    private String offerLetterFileName;
    private String offerLetterOriginalName;
}
