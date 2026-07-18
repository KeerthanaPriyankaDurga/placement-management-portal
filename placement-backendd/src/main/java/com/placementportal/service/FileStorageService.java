package com.placementportal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.resume-dir}")
    private String resumeDir;

    @Value("${app.upload.offer-dir}")
    private String offerDir;

    private Path resolveDir(String configuredDir) throws IOException {
        Path dir = Paths.get(configuredDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        return dir;
    }

    private String storePdf(MultipartFile file, String namePrefix, String baseDir) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        Path uploadDir = resolveDir(baseDir);
        String storedFileName = namePrefix + "_" + UUID.randomUUID() + ".pdf";
        Path target = uploadDir.resolve(storedFileName);
        Files.copy(file.getInputStream(), target);
        return storedFileName;
    }

    /** Saves a student's resume PDF. Returns the generated on-disk filename. */
    public String storeResume(MultipartFile file, Long studentId) throws IOException {
        return storePdf(file, "student_" + studentId, resumeDir);
    }

    public Resource loadResume(String storedFileName) throws IOException {
        return loadFrom(resumeDir, storedFileName);
    }

    public void deleteResumeIfExists(String storedFileName) throws IOException {
        deleteFrom(resumeDir, storedFileName);
    }

    /** Saves an offer letter PDF for a given application. Returns the generated on-disk filename. */
    public String storeOfferLetter(MultipartFile file, Long applicationId) throws IOException {
        return storePdf(file, "offer_" + applicationId, offerDir);
    }

    public Resource loadOfferLetter(String storedFileName) throws IOException {
        return loadFrom(offerDir, storedFileName);
    }

    public void deleteOfferLetterIfExists(String storedFileName) throws IOException {
        deleteFrom(offerDir, storedFileName);
    }

    private Resource loadFrom(String baseDir, String storedFileName) throws IOException {
        Path uploadDir = resolveDir(baseDir);
        Path filePath = uploadDir.resolve(storedFileName).normalize();
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found on server: " + storedFileName);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found on server: " + storedFileName, e);
        }
    }

    private void deleteFrom(String baseDir, String storedFileName) throws IOException {
        if (storedFileName == null) return;
        Path uploadDir = resolveDir(baseDir);
        Files.deleteIfExists(uploadDir.resolve(storedFileName));
    }
}
