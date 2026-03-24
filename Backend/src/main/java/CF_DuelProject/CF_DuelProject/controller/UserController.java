package CF_DuelProject.CF_DuelProject.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
