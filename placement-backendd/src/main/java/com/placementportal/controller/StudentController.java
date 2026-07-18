package com.placementportal.controller;

import com.placementportal.dto.ApplicationResponse;
import com.placementportal.dto.StudentProfileResponse;
import com.placementportal.dto.StudentProfileUpdateRequest;
import com.placementportal.model.*;
import com.placementportal.repository.ApplicationRepository;
import com.placementportal.repository.JobOfferRepository;
import com.placementportal.repository.SavedJobRepository;
import com.placementportal.repository.StudentProfileRepository;
import com.placementportal.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // ---------- Profile ----------

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found for this student"));
        return ResponseEntity.ok(toProfileResponse(user, profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user,
                                            @RequestBody StudentProfileUpdateRequest request) {
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found for this student"));

        profile.setDepartment(request.getDepartment());
        profile.setBatch(request.getBatch());
        if (request.getCgpa() != null) {
            profile.setCgpa(request.getCgpa());
        }
        profile.setSkills(request.getSkills());
        studentProfileRepository.save(profile);

        return ResponseEntity.ok(toProfileResponse(user, profile));
    }

    // ---------- Resume ----------

    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(@AuthenticationPrincipal User user,
                                           @RequestParam("file") MultipartFile file) {
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found for this student"));
        try {
            fileStorageService.deleteResumeIfExists(profile.getResumeFileName());

            String storedFileName = fileStorageService.storeResume(file, user.getId());
            profile.setResumeFileName(storedFileName);
            profile.setResumeOriginalName(file.getOriginalFilename());
            studentProfileRepository.save(profile);

            return ResponseEntity.ok(toProfileResponse(user, profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to save resume. Please try again."));
        }
    }

    @DeleteMapping("/resume")
    public ResponseEntity<?> deleteResume(@AuthenticationPrincipal User user) {
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found for this student"));
        try {
            fileStorageService.deleteResumeIfExists(profile.getResumeFileName());
            profile.setResumeFileName(null);
            profile.setResumeOriginalName(null);
            studentProfileRepository.save(profile);
            return ResponseEntity.ok(toProfileResponse(user, profile));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to delete resume."));
        }
    }

    @GetMapping("/resume")
    public ResponseEntity<?> downloadOwnResume(@AuthenticationPrincipal User user) {
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found for this student"));
        if (profile.getResumeFileName() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No resume uploaded yet"));
        }
        try {
            Resource resource = fileStorageService.loadResume(profile.getResumeFileName());
            String downloadName = profile.getResumeOriginalName() != null
                    ? profile.getResumeOriginalName() : "resume.pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not retrieve resume file"));
        }
    }

    // ---------- Dashboard ----------

    @GetMapping("/stats")
    public ResponseEntity<?> getStudentStats(@AuthenticationPrincipal User user) {
        long applicationsCount = applicationRepository.countByStudentId(user.getId());
        long offers = applicationRepository.countByStudentIdAndStatus(user.getId(), ApplicationStatus.SELECTED)
                + applicationRepository.countByStudentIdAndStatus(user.getId(), ApplicationStatus.PLACED);
        long pending = applicationRepository.countByStudentIdAndStatus(user.getId(), ApplicationStatus.PENDING);

        Map<String, Object> stats = new HashMap<>();
        stats.put("applications", applicationsCount);
        stats.put("offers", offers);
        stats.put("pending", pending);

        Map<String, Long> breakdown = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            breakdown.put(status.name(), applicationRepository.countByStudentIdAndStatus(user.getId(), status));
        }
        stats.put("statusBreakdown", breakdown);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activities")
    public ResponseEntity<?> getStudentActivities(@AuthenticationPrincipal User user) {
        List<Application> recent = applicationRepository.findByStudentId(user.getId());
        List<Map<String, String>> activities = new ArrayList<>();

        for (Application a : recent) {
            Map<String, String> item = new HashMap<>();
            item.put("text", "Applied for " + a.getJob().getTitle() + " at " + a.getJob().getCompany().getName());
            item.put("time", a.getAppliedAt() != null ? a.getAppliedAt().toString() : "");
            activities.add(item);
        }

        if (activities.isEmpty()) {
            Map<String, String> item = new HashMap<>();
            item.put("text", "Account created successfully");
            item.put("time", "Recently");
            activities.add(item);
        }

        return ResponseEntity.ok(activities);
    }

    // ---------- Jobs, Applications & Saved Jobs ----------

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<?> applyToJob(@AuthenticationPrincipal User user, @PathVariable Long jobId) {
        if (applicationRepository.existsByStudentIdAndJobId(user.getId(), jobId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already applied to this job"));
        }

        JobOffer job = jobOfferRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.isActive() || (job.getExpiryDate() != null && job.getExpiryDate().isBefore(LocalDate.now()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "This job is no longer accepting applications"));
        }

        Application application = new Application();
        application.setStudent(user);
        application.setJob(job);
        applicationRepository.save(application);

        return ResponseEntity.ok(Map.of("message", "Applied successfully"));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(@AuthenticationPrincipal User user) {
        List<Application> applications = applicationRepository.findByStudentId(user.getId());
        StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);

        List<ApplicationResponse> response = applications.stream()
                .map(a -> toApplicationResponse(a, user, profile))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/applications/{id}/accept-offer")
    public ResponseEntity<?> acceptOffer(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getStudent().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "This is not your application"));
        }
        if (application.getStatus() != ApplicationStatus.SELECTED) {
            return ResponseEntity.badRequest().body(Map.of("message", "You can only accept an offer that has been extended to you"));
        }

        application.setStatus(ApplicationStatus.PLACED);
        applicationRepository.save(application);
        return ResponseEntity.ok(Map.of("message", "Offer accepted! Congratulations."));
    }

    @GetMapping("/applications/{id}/offer-letter")
    public ResponseEntity<?> downloadOfferLetter(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!application.getStudent().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "This is not your application"));
        }
        if (application.getOfferLetterFileName() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No offer letter has been uploaded for this application yet"));
        }
        try {
            Resource resource = fileStorageService.loadOfferLetter(application.getOfferLetterFileName());
            String downloadName = application.getOfferLetterOriginalName() != null
                    ? application.getOfferLetterOriginalName() : "offer_letter.pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not retrieve offer letter"));
        }
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<ApplicationResponse>> getUpcomingInterviews(@AuthenticationPrincipal User user) {
        StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);
        List<ApplicationResponse> upcoming = applicationRepository.findByStudentId(user.getId()).stream()
                .filter(a -> a.getInterviewDate() != null && !a.getInterviewDate().isBefore(LocalDate.now()))
                .map(a -> toApplicationResponse(a, user, profile))
                .collect(Collectors.toList());
        return ResponseEntity.ok(upcoming);
    }

    @PostMapping("/jobs/{jobId}/save")
    public ResponseEntity<?> saveJob(@AuthenticationPrincipal User user, @PathVariable Long jobId) {
        if (savedJobRepository.existsByStudentIdAndJobId(user.getId(), jobId)) {
            return ResponseEntity.ok(Map.of("message", "Already saved"));
        }
        JobOffer job = jobOfferRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        SavedJob savedJob = new SavedJob();
        savedJob.setStudent(user);
        savedJob.setJob(job);
        savedJobRepository.save(savedJob);
        return ResponseEntity.ok(Map.of("message", "Job saved"));
    }

    @DeleteMapping("/jobs/{jobId}/save")
    public ResponseEntity<?> unsaveJob(@AuthenticationPrincipal User user, @PathVariable Long jobId) {
        savedJobRepository.deleteByStudentIdAndJobId(user.getId(), jobId);
        return ResponseEntity.ok(Map.of("message", "Job removed from saved list"));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<List<com.placementportal.dto.JobResponse>> getSavedJobs(@AuthenticationPrincipal User user) {
        List<SavedJob> saved = savedJobRepository.findByStudentId(user.getId());
        List<com.placementportal.dto.JobResponse> response = saved.stream().map(sj -> {
            JobOffer job = sj.getJob();
            com.placementportal.dto.JobResponse jr = new com.placementportal.dto.JobResponse();
            jr.setId(job.getId());
            jr.setTitle(job.getTitle());
            jr.setDescription(job.getDescription());
            jr.setLocation(job.getLocation());
            jr.setPackageOffers(job.getPackageOffers());
            jr.setActive(job.isActive());
            jr.setPostedAt(job.getPostedAt());
            jr.setExpiryDate(job.getExpiryDate());
            jr.setExpired(job.getExpiryDate() != null && job.getExpiryDate().isBefore(LocalDate.now()));
            jr.setCompanyId(job.getCompany().getId());
            jr.setCompanyName(job.getCompany().getName());
            jr.setApplicantsCount(applicationRepository.countByJobId(job.getId()));
            jr.setAppliedByCurrentUser(applicationRepository.existsByStudentIdAndJobId(user.getId(), job.getId()));
            jr.setSavedByCurrentUser(true);
            return jr;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private StudentProfileResponse toProfileResponse(User user, StudentProfile profile) {
        int completion = 0;
        if (profile.getDepartment() != null && !profile.getDepartment().isBlank()) completion += 20;
        if (profile.getBatch() != null && !profile.getBatch().isBlank()) completion += 20;
        if (profile.getCgpa() != null) completion += 20;
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) completion += 20;
        if (profile.getResumeFileName() != null) completion += 20;

        return new StudentProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                profile.getDepartment(), profile.getBatch(), profile.getCgpa(), profile.getSkills(),
                profile.getResumeOriginalName(), completion
        );
    }

    private ApplicationResponse toApplicationResponse(Application a, User user, StudentProfile profile) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(a.getId());
        response.setStudentId(user.getId());
        response.setStudentName(user.getName());
        response.setDepartment(profile != null ? profile.getDepartment() : null);
        response.setCgpa(profile != null ? profile.getCgpa() : null);
        response.setJobId(a.getJob().getId());
        response.setJobTitle(a.getJob().getTitle());
        response.setCompanyName(a.getJob().getCompany().getName());
        response.setStatus(a.getStatus().name());
        response.setAppliedAt(a.getAppliedAt());
        response.setInterviewDate(a.getInterviewDate());
        response.setInterviewTime(a.getInterviewTime());
        response.setInterviewVenue(a.getInterviewVenue());
        response.setInterviewMode(a.getInterviewMode());
        response.setInterviewMeetingLink(a.getInterviewMeetingLink());
        response.setInterviewInstructions(a.getInterviewInstructions());
        response.setOfferLetterAvailable(a.getOfferLetterFileName() != null);
        return response;
    }
}
