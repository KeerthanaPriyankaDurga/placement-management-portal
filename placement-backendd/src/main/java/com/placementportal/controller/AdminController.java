package com.placementportal.controller;

import com.placementportal.dto.ApplicationResponse;
import com.placementportal.dto.AdminStatsResponse;
import com.placementportal.dto.CompanyProfileResponse;
import com.placementportal.dto.CreateCompanyRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private NotificationService notificationService;

    // ---------- Students ----------

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        List<User> students = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.STUDENT)
                .toList();
        return ResponseEntity.ok(students);
    }

    @PostMapping("/students/{id}/approve")
    public ResponseEntity<?> approveStudent(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getRole() == Role.STUDENT) {
            User user = userOpt.get();
            user.setApproved(true);
            userRepository.save(user);
            notificationService.notify(user, "Your student account has been approved. You can now log in and start applying.", "APPROVAL");
            return ResponseEntity.ok(Map.of("message", "Student approved successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
    }

    @PostMapping("/students/{id}/reject")
    public ResponseEntity<?> rejectStudent(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getRole() == Role.STUDENT) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Student registration rejected and removed"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
    }

    @GetMapping("/students/{id}/resume")
    public ResponseEntity<?> downloadStudentResume(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || userOpt.get().getRole() != Role.STUDENT) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student not found"));
        }
        StudentProfile profile = studentProfileRepository.findByUserId(id)
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

    @GetMapping("/stats/departments")
    public ResponseEntity<Map<String, Long>> getDepartmentStats() {
        List<StudentProfile> profiles = studentProfileRepository.findAll();
        Map<String, Long> byDepartment = profiles.stream()
                .map(p -> p.getDepartment() == null || p.getDepartment().isBlank() ? "Not specified" : p.getDepartment())
                .collect(Collectors.groupingBy(dept -> dept, Collectors.counting()));
        return ResponseEntity.ok(byDepartment);
    }

    // ---------- Companies ----------

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyProfileResponse>> getAllCompanies() {
        List<User> companies = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COMPANY)
                .toList();

        List<CompanyProfileResponse> response = companies.stream().map(company -> {
            CompanyProfile profile = companyProfileRepository.findByUser(company).orElse(null);
            long activeJobs = jobOfferRepository.findByCompanyId(company.getId()).stream()
                    .filter(JobOffer::isActive).count();
            return new CompanyProfileResponse(
                    company.getId(), company.getName(), company.getEmail(),
                    profile != null ? profile.getIndustry() : null,
                    profile != null ? profile.getWebsite() : null,
                    profile != null ? profile.getDescription() : null,
                    activeJobs,
                    company.isApproved()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable Long id,
                                            @RequestBody com.placementportal.dto.CompanyProfileUpdateRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || userOpt.get().getRole() != Role.COMPANY) {
            return ResponseEntity.badRequest().body(Map.of("message", "Company not found"));
        }
        User company = userOpt.get();
        CompanyProfile profile = companyProfileRepository.findByUser(company).orElseGet(() -> {
            CompanyProfile p = new CompanyProfile();
            p.setUser(company);
            return p;
        });
        profile.setIndustry(request.getIndustry());
        profile.setWebsite(request.getWebsite());
        profile.setDescription(request.getDescription());
        companyProfileRepository.save(profile);

        long activeJobs = jobOfferRepository.findByCompanyId(company.getId()).stream()
                .filter(JobOffer::isActive).count();
        return ResponseEntity.ok(new CompanyProfileResponse(
                company.getId(), company.getName(), company.getEmail(),
                profile.getIndustry(), profile.getWebsite(), profile.getDescription(),
                activeJobs, company.isApproved()
        ));
    }

    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(@RequestBody CreateCompanyRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User company = new User();
        company.setName(request.getName());
        company.setEmail(request.getEmail());
        company.setPassword(passwordEncoder.encode(request.getPassword()));
        company.setRole(Role.COMPANY);
        // Companies now go through the same verification step as students:
        // they cannot log in (and therefore cannot post jobs) until an Admin approves them.
        company.setApproved(false);
        company = userRepository.save(company);

        CompanyProfile profile = new CompanyProfile();
        profile.setUser(company);
        profile.setIndustry(request.getIndustry());
        profile.setWebsite(request.getWebsite());
        companyProfileRepository.save(profile);

        return ResponseEntity.ok(Map.of("message", "Company account created. It is pending your verification before it can log in."));
    }

    @PostMapping("/companies/{id}/approve")
    public ResponseEntity<?> approveCompany(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getRole() == Role.COMPANY) {
            User company = userOpt.get();
            company.setApproved(true);
            userRepository.save(company);
            notificationService.notify(company, "Your company account has been verified. You can now log in and post jobs.", "APPROVAL");
            return ResponseEntity.ok(Map.of("message", "Company verified successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Company not found"));
    }

    @PostMapping("/companies/{id}/reject")
    public ResponseEntity<?> rejectCompany(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getRole() == Role.COMPANY) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Company rejected and removed"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Company not found"));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getRole() == Role.COMPANY) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Company removed successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Company not found"));
    }

    // ---------- Applications ----------

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        List<Application> applications = applicationRepository.findAll();

        List<ApplicationResponse> response = applications.stream().map(a -> {
            StudentProfile profile = studentProfileRepository.findByUserId(a.getStudent().getId()).orElse(null);
            ApplicationResponse ar = new ApplicationResponse();
            ar.setId(a.getId());
            ar.setStudentId(a.getStudent().getId());
            ar.setStudentName(a.getStudent().getName());
            ar.setDepartment(profile != null ? profile.getDepartment() : null);
            ar.setCgpa(profile != null ? profile.getCgpa() : null);
            ar.setJobId(a.getJob().getId());
            ar.setJobTitle(a.getJob().getTitle());
            ar.setCompanyName(a.getJob().getCompany().getName());
            ar.setStatus(a.getStatus().name());
            ar.setAppliedAt(a.getAppliedAt());
            ar.setInterviewDate(a.getInterviewDate());
            ar.setInterviewTime(a.getInterviewTime());
            ar.setInterviewVenue(a.getInterviewVenue());
            ar.setInterviewMode(a.getInterviewMode());
            ar.setInterviewMeetingLink(a.getInterviewMeetingLink());
            ar.setInterviewInstructions(a.getInterviewInstructions());
            ar.setOfferLetterAvailable(a.getOfferLetterFileName() != null);
            return ar;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id,
                                                       @RequestBody com.placementportal.dto.ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

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

        StudentProfile profile = studentProfileRepository.findByUserId(application.getStudent().getId()).orElse(null);
        ApplicationResponse ar = new ApplicationResponse();
        ar.setId(application.getId());
        ar.setStudentId(application.getStudent().getId());
        ar.setStudentName(application.getStudent().getName());
        ar.setDepartment(profile != null ? profile.getDepartment() : null);
        ar.setCgpa(profile != null ? profile.getCgpa() : null);
        ar.setJobId(application.getJob().getId());
        ar.setJobTitle(application.getJob().getTitle());
        ar.setCompanyName(application.getJob().getCompany().getName());
        ar.setStatus(application.getStatus().name());
        ar.setAppliedAt(application.getAppliedAt());
        ar.setInterviewDate(application.getInterviewDate());
        ar.setInterviewTime(application.getInterviewTime());
        ar.setInterviewVenue(application.getInterviewVenue());
        ar.setInterviewMode(application.getInterviewMode());
        ar.setInterviewMeetingLink(application.getInterviewMeetingLink());
        ar.setInterviewInstructions(application.getInterviewInstructions());
        ar.setOfferLetterAvailable(application.getOfferLetterFileName() != null);
        return ResponseEntity.ok(ar);
    }

    @PutMapping("/applications/{id}/interview")
    public ResponseEntity<?> scheduleInterview(@PathVariable Long id,
                                                @RequestBody com.placementportal.dto.InterviewScheduleRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

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

        StudentProfile profile = studentProfileRepository.findByUserId(application.getStudent().getId()).orElse(null);
        ApplicationResponse ar = new ApplicationResponse();
        ar.setId(application.getId());
        ar.setStudentId(application.getStudent().getId());
        ar.setStudentName(application.getStudent().getName());
        ar.setDepartment(profile != null ? profile.getDepartment() : null);
        ar.setCgpa(profile != null ? profile.getCgpa() : null);
        ar.setJobId(application.getJob().getId());
        ar.setJobTitle(application.getJob().getTitle());
        ar.setCompanyName(application.getJob().getCompany().getName());
        ar.setStatus(application.getStatus().name());
        ar.setAppliedAt(application.getAppliedAt());
        ar.setInterviewDate(application.getInterviewDate());
        ar.setInterviewTime(application.getInterviewTime());
        ar.setInterviewVenue(application.getInterviewVenue());
        ar.setInterviewMode(application.getInterviewMode());
        ar.setInterviewMeetingLink(application.getInterviewMeetingLink());
        ar.setInterviewInstructions(application.getInterviewInstructions());
        ar.setOfferLetterAvailable(application.getOfferLetterFileName() != null);
        return ResponseEntity.ok(ar);
    }

    // ---------- Statistics ----------

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        List<User> allUsers = userRepository.findAll();

        long totalStudents = allUsers.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long approvedStudents = allUsers.stream().filter(u -> u.getRole() == Role.STUDENT && u.isApproved()).count();
        long pendingStudents = totalStudents - approvedStudents;
        long totalCompanies = allUsers.stream().filter(u -> u.getRole() == Role.COMPANY).count();
        long totalJobs = jobOfferRepository.count();
        long totalApplications = applicationRepository.count();
        long placedStudents = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.PLACED)
                .map(a -> a.getStudent().getId())
                .distinct()
                .count();
        double placementRate = approvedStudents == 0 ? 0.0
                : Math.round((placedStudents * 10000.0) / approvedStudents) / 100.0;

        AdminStatsResponse stats = new AdminStatsResponse(
                totalStudents, approvedStudents, pendingStudents,
                totalCompanies, totalJobs, totalApplications, placedStudents, placementRate
        );
        return ResponseEntity.ok(stats);
    }
}
