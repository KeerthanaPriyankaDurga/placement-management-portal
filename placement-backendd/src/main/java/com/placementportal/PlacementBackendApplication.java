package com.placementportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.placementportal.model.User;
import com.placementportal.model.Role;
import com.placementportal.repository.UserRepository;

@SpringBootApplication
public class PlacementBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlacementBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@mallareddyuniversity.ac.in").isEmpty()) {
				User admin = new User();
				admin.setName("MRU Administrator");
				admin.setEmail("admin@mallareddyuniversity.ac.in");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(Role.ADMIN);
				admin.setApproved(true);
				userRepository.save(admin);
			}
		};
	}
}
