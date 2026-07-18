package com.placementportal.controller;

import com.placementportal.dto.*;
import com.placementportal.model.*;
import com.placementportal.repository.*;
import com.placementportal.service.FileStorageService;
import com.placementportal.service.NotificationService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyController {

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private NotificationService notificationService;

    // ---------- Profile ----------

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        CompanyProfile profile = getOrCreateProfile(user);
        return ResponseEntity.ok(toProfileResponse(user, profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user,
                                            @RequestBody CompanyProfileUpdateRequest request) {
        CompanyProfile profile = getOrCreateProfile(user);
        profile.setIndustry(request.getIndustry());
        profile.setWebsite(request.getWebsite());
        profile.setDescription(request.getDescription());
        companyProfileRepository.save(profile);
        return ResponseEntity.ok(toProfileResponse(user, profile));
    }

    // ---------- Jobs ----------

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(@AuthenticationPrincipal User user) {
        List<JobOffer> jobs = jobOfferRepository.findByCompanyId(user.getId());
        return ResponseEntity.ok(jobs.stream().map(this::toJobResponse).collect(Collectors.toList()));
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@AuthenticationPrincipal User user, @RequestBody JobRequest request) {
        JobOffer job = new JobOffer();
        job.setCompany(user);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setPackageOffers(request.getPackageOffers());
        job.setActive(request.getActive() == null || request.getActive());
        job.setExpiryDate(request.getExpiryDate());
        jobOfferRepository.save(job);
        return ResponseEntity.ok(toJobResponse(job));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(@AuthenticationPrincipal User user, @PathVariable Long id,
                                        @RequestBody JobRequest request) {
        JobOffer job = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setPackageOffers(request.getPackageOffers());
        job.setExpiryDate(request.getExpiryDate());
        if (request.getActive() != null) {
            job.setActive(request.getActive());
        }
        jobOfferRepository.save(job);
        return ResponseEntity.ok(toJobResponse(job));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@AuthenticationPrincipal User user, @PathVariable Long id) {
        JobOffer job = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        jobOfferRepository.delete(job);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    // ---------- Applicants ----------

    @GetMapping("/jobs/{id}/applicants")
    public ResponseEntity<?> getApplicantsForJob(@AuthenticationPrincipal User user, @PathVariable Long id) {
        JobOffer job = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        List<Application> applications = applicationRepository.findByJobId(id);
        return ResponseEntity.ok(applications.stream().map(this::toApplicationResponse).collect(Collectors.toList()));
    }

    @GetMapping("/applicants")
    public ResponseEntity<List<ApplicationResponse>> getAllApplicants(@AuthenticationPrincipal User user) {
        List<Application> applications = applicationRepository.findByJob_CompanyId(user.getId());
        return ResponseEntity.ok(applications.stream().map(this::toApplicationResponse).collect(Collectors.toList()));
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                      @RequestBody ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!application.getJob().getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        ApplicationStatus status;
        try {
            status = ApplicationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value"));
        }
        application.setStatus(status);
        applicationRepository.save(application);

        String jobTitle = application.getJob().getTitle();
        String companyName = application.getJob().getCompany().getName();
        String message = switch (status) {
            case SHORTLISTED -> "You've been shortlisted for " + jobTitle + " at " + companyName + "!";
            case SELECTED -> "Congratulations! You've received an offer for " + jobTitle + " at " + companyName + ".";
            case REJECTED -> "Your application for " + jobTitle + " at " + companyName + " was not selected this time.";
            default -> "Your application for " + jobTitle + " at " + companyName + " was updated.";
        };
        notificationService.notify(application.getStudent(), message, "APPLICATION");

        return ResponseEntity.ok(toApplicationResponse(application));
    }

    @GetMapping("/applications/{id}/resume")
    public ResponseEntity<?> downloadApplicantResume(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!application.getJob().getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        StudentProfile profile = studentProfileRepository.findByUserId(application.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        if (profile.getResumeFileName() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "This student has not uploaded a resume yet"));
        }
        try {
            Resource resource = fileStorageService.loadResume(profile.getResumeFileName());
            String downloadName = profile.getResumeOriginalName() != null
                    ? profile.getResumeOriginalName() : "resume.pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not retrieve resume file"));
        }
    }

    // ---------- Interview scheduling ----------

    @PutMapping("/applications/{id}/interview")
    public ResponseEntity<?> scheduleInterview(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                @RequestBody InterviewScheduleRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!application.getJob().getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        application.setInterviewDate(request.getInterviewDate());
        application.setInterviewTime(request.getInterviewTime());
        application.setInterviewVenue(request.getInterviewVenue());
        application.setInterviewMode(request.getInterviewMode());
        application.setInterviewMeetingLink(request.getInterviewMeetingLink());
        application.setInterviewInstructions(request.getInterviewInstructions());
        applicationRepository.save(application);

        notificationService.notify(application.getStudent(),
                "Interview scheduled for " + application.getJob().getTitle() + " at "
                        + application.getJob().getCompany().getName() + " on "
                        + request.getInterviewDate() + (request.getInterviewTime() != null ? " at " + request.getInterviewTime() : "") + ".",
                "INTERVIEW");

        return ResponseEntity.ok(toApplicationResponse(application));
    }

    // ---------- Offer letter ----------

    @PostMapping("/applications/{id}/offer-letter")
    public ResponseEntity<?> uploadOfferLetter(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                @RequestParam("file") MultipartFile file) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!application.getJob().getCompany().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You do not own this job posting"));
        }
        try {
            fileStorageService.deleteOfferLetterIfExists(application.getOfferLetterFileName());
            String storedFileName = fileStorageService.storeOfferLetter(file, application.getId());
            application.setOfferLetterFileName(storedFileName);
            application.setOfferLetterOriginalName(file.getOriginalFilename());
            applicationRepository.save(application);

            notificationService.notify(application.getStudent(),
                    "An offer letter has been uploaded for your " + application.getJob().getTitle()
                            + " offer at " + application.getJob().getCompany().getName() + ".",
                    "OFFER");

            return ResponseEntity.ok(toApplicationResponse(application));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to save offer letter."));
        }
    }

    // ---------- Stats ----------

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal User user) {
        List<JobOffer> jobs = jobOfferRepository.findByCompanyId(user.getId());
        long postedJobs = jobs.stream().filter(JobOffer::isActive).count();

        List<Application> applications = applicationRepository.findByJob_CompanyId(user.getId());
        long totalApplicants = applications.size();
        long shortlisted = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("postedJobs", postedJobs);
        stats.put("totalApplicants", totalApplicants);
        stats.put("shortlisted", shortlisted);
        return ResponseEntity.ok(stats);
    }

    // ---------- Helpers ----------

    private CompanyProfile getOrCreateProfile(User user) {
        Optional<CompanyProfile> existing = companyProfileRepository.findByUser(user);
        if (existing.isPresent()) {
            return existing.get();
        }
        CompanyProfile profile = new CompanyProfile();
        profile.setUser(user);
        return companyProfileRepository.save(profile);
    }

    private CompanyProfileResponse toProfileResponse(User user, CompanyProfile profile) {
        long activeJobs = jobOfferRepository.findByCompanyId(user.getId()).stream()
                .filter(JobOffer::isActive).count();
        return new CompanyProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                profile.getIndustry(), profile.getWebsite(), profile.getDescription(), activeJobs,
                user.isApproved()
        );
    }

    private JobResponse toJobResponse(JobOffer job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setLocation(job.getLocation());
        response.setPackageOffers(job.getPackageOffers());
        response.setActive(job.isActive());
        response.setPostedAt(job.getPostedAt());
        response.setExpiryDate(job.getExpiryDate());
        response.setExpired(job.getExpiryDate() != null && job.getExpiryDate().isBefore(LocalDate.now()));
        response.setCompanyId(job.getCompany().getId());
        response.setCompanyName(job.getCompany().getName());
        response.setApplicantsCount(applicationRepository.countByJobId(job.getId()));
        return response;
    }

    private ApplicationResponse toApplicationResponse(Application application) {
        String department = null;
        Double cgpa = null;
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(application.getStudent().getId());
        if (profileOpt.isPresent()) {
            department = profileOpt.get().getDepartment();
            cgpa = profileOpt.get().getCgpa();
        }
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
        response.setStudentId(application.getStudent().getId());
        response.setStudentName(application.getStudent().getName());
        response.setDepartment(department);
        response.setCgpa(cgpa);
        response.setJobId(application.getJob().getId());
        response.setJobTitle(application.getJob().getTitle());
        response.setCompanyName(application.getJob().getCompany().getName());
        response.setStatus(application.getStatus().name());
        response.setAppliedAt(application.getAppliedAt());
        response.setInterviewDate(application.getInterviewDate());
        response.setInterviewTime(application.getInterviewTime());
        response.setInterviewVenue(application.getInterviewVenue());
        response.setInterviewMode(application.getInterviewMode());
        response.setInterviewMeetingLink(application.getInterviewMeetingLink());
        response.setInterviewInstructions(application.getInterviewInstructions());
        response.setOfferLetterAvailable(application.getOfferLetterFileName() != null);
        return response;
    }
}
