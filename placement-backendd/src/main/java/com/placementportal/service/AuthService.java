package com.placementportal.service;

import com.placementportal.dto.AuthResponse;
import com.placementportal.dto.LoginRequest;
import com.placementportal.dto.RegisterRequest;
import com.placementportal.model.Role;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import com.placementportal.repository.StudentProfileRepository;
import com.placementportal.repository.UserRepository;
import com.placementportal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationService notificationService;

    public void register(RegisterRequest request) throws Exception {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new Exception("Email already exists");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        if (role != Role.STUDENT) {
            throw new Exception("Only students can register through this portal. Contact Administrator for Admin/Company accounts.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        // Students are auto-approved and can log in immediately.
        // Companies still go through Admin verification (see AdminController.createCompany).
        user.setApproved(true);

        user = userRepository.save(user);
        final User savedUser = user;

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setDepartment(request.getDepartment());
        profile.setBatch(request.getBatch());
        profile.setCgpa(0.0);

        studentProfileRepository.save(profile);

        // Let every admin know a new student has joined (informational only - no action required)
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.notify(
                        admin, "New student registered: " + savedUser.getName() + ".", "APPROVAL"
                ));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);

        return new AuthResponse(token, user.getId(), user.getRole().name());
    }
}
