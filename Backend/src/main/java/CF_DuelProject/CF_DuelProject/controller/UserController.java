package CF_DuelProject.CF_DuelProject.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import CF_DuelProject.CF_DuelProject.dto.CfHandleRequest;
import CF_DuelProject.CF_DuelProject.model.User;
import CF_DuelProject.CF_DuelProject.repository.UserRepository;
import CF_DuelProject.CF_DuelProject.service.JwtService;

@RestController
@RequestMapping("/user")
public class UserController {
     @Autowired
    UserRepository userRepository;

    @Autowired
    JwtService jwtService;

    
   @GetMapping("/me")
        public ResponseEntity<?> getMe(Authentication authentication) {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = (String) authentication.getPrincipal();
            // ✅ Use orElse instead of .get()
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("cfHandle", user.getCfHandle());

            return ResponseEntity.ok(response);
        }


    @PostMapping("/add-cf")
    public String addCf(@RequestHeader("Authorization") String token,
                        @RequestBody CfHandleRequest req) {

        String email = jwtService.extractEmail(token.replace("Bearer ", ""));

        User user = userRepository.findByEmail(email).get();
        user.setCfHandle(req.getCfHandle());

        userRepository.save(user);

        return "CF added";
    }
}
