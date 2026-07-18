package com.placementportal.repository;

import com.placementportal.model.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByStudentId(Long studentId);
    Optional<SavedJob> findByStudentIdAndJobId(Long studentId, Long jobId);
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
    void deleteByStudentIdAndJobId(Long studentId, Long jobId);
}
