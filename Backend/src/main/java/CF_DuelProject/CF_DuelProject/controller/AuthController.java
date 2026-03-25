package CF_DuelProject.CF_DuelProject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import CF_DuelProject.CF_DuelProject.dto.AuthRequest;
import CF_DuelProject.CF_DuelProject.dto.AuthResponse;
import CF_DuelProject.CF_DuelProject.dto.RegisterRequest;
import CF_DuelProject.CF_DuelProject.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest req) {
        String token = authService.login(req);
        System.out.println("Token: " + token);
        return new AuthResponse(token);
    }
    
}
