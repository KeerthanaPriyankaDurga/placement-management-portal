package com.placementportal.controller;

import com.placementportal.dto.JobResponse;
import com.placementportal.model.CompanyProfile;
import com.placementportal.model.JobOffer;
import com.placementportal.model.Role;
import com.placementportal.model.User;
import com.placementportal.repository.ApplicationRepository;
import com.placementportal.repository.CompanyProfileRepository;
import com.placementportal.repository.JobOfferRepository;
import com.placementportal.repository.SavedJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Shared job-browsing endpoints, available to any authenticated user
// (students browse to apply, admins/companies can view the same list read-only).
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllActiveJobs(@AuthenticationPrincipal User user) {
        LocalDate today = LocalDate.now();
        List<JobOffer> jobs = jobOfferRepository.findByActiveTrue().stream()
                .filter(job -> job.getExpiryDate() == null || !job.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());

        List<JobResponse> response = jobs.stream()
                .map(job -> toResponse(job, user))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Map<String, Object>>> getCompaniesWithOpenJobs() {
        LocalDate today = LocalDate.now();
        List<JobOffer> jobs = jobOfferRepository.findByActiveTrue().stream()
                .filter(job -> job.getExpiryDate() == null || !job.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());

        Map<Long, List<JobOffer>> byCompany = jobs.stream()
                .collect(Collectors.groupingBy(j -> j.getCompany().getId()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, List<JobOffer>> entry : byCompany.entrySet()) {
            User company = entry.getValue().get(0).getCompany();
            CompanyProfile profile = companyProfileRepository.findByUser(company).orElse(null);
            Map<String, Object> item = new HashMap<>();
            item.put("id", company.getId());
            item.put("name", company.getName());
            item.put("openJobs", entry.getValue().size());
            item.put("industry", profile != null ? profile.getIndustry() : null);
            item.put("website", profile != null ? profile.getWebsite() : null);
            item.put("description", profile != null ? profile.getDescription() : null);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // Full company details + its open jobs, for the student-facing Company Details page
    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompanyDetails(@PathVariable Long id, @AuthenticationPrincipal User user) {
        LocalDate today = LocalDate.now();
        List<JobOffer> allJobsForCompany = jobOfferRepository.findByCompanyId(id);
        if (allJobsForCompany.isEmpty()) {
            // Company may exist with zero jobs ever posted; look it up defensively.
            return ResponseEntity.badRequest().body(Map.of("message", "Company not found or has no jobs"));
        }
        User company = allJobsForCompany.get(0).getCompany();
        CompanyProfile profile = companyProfileRepository.findByUser(company).orElse(null);

        List<JobOffer> openJobs = allJobsForCompany.stream()
                .filter(JobOffer::isActive)
                .filter(job -> job.getExpiryDate() == null || !job.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("id", company.getId());
        response.put("name", company.getName());
        response.put("industry", profile != null ? profile.getIndustry() : null);
        response.put("website", profile != null ? profile.getWebsite() : null);
        response.put("description", profile != null ? profile.getDescription() : null);
        response.put("activeJobs", openJobs.size());
        response.put("jobs", openJobs.stream().map(job -> toResponse(job, user)).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    private JobResponse toResponse(JobOffer job, User currentUser) {
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

        if (currentUser != null && currentUser.getRole() == Role.STUDENT) {
            response.setAppliedByCurrentUser(
                    applicationRepository.existsByStudentIdAndJobId(currentUser.getId(), job.getId()));
            response.setSavedByCurrentUser(
                    savedJobRepository.existsByStudentIdAndJobId(currentUser.getId(), job.getId()));
        }
        return response;
    }
}
