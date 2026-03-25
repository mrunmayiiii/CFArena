package CF_DuelProject.CF_DuelProject.service;

import org.springframework.stereotype.Service;

import CF_DuelProject.CF_DuelProject.model.User;
import CF_DuelProject.CF_DuelProject.repository.UserRepository;

@Service
public class UserService {
     private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getCfHandleByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (user.getCfHandle() == null || user.getCfHandle().isBlank()) {
            throw new RuntimeException("CF handle not set for user: " + email);
        }

        return user.getCfHandle();
    }
}
