package com.placementportal.repository;

import com.placementportal.model.Application;
import com.placementportal.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    List<Application> findByJobId(Long jobId);
    long countByStudentId(Long studentId);
    long countByJobId(Long jobId);
    long countByStudentIdAndStatus(Long studentId, ApplicationStatus status);
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
    List<Application> findByJob_CompanyId(Long companyId);
}
