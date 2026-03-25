package CF_DuelProject.CF_DuelProject.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import CF_DuelProject.CF_DuelProject.model.Match;
import CF_DuelProject.CF_DuelProject.service.MatchService;
import CF_DuelProject.CF_DuelProject.service.UserService;

@RestController
@RequestMapping("api/match")
public class MatchController {

    private final MatchService matchService;
    private final UserService userService;

    public MatchController(MatchService matchService, UserService userService) {
        this.matchService = matchService;
        this.userService = userService;
    }

    @PostMapping("/create")
    public Match create(Authentication authentication) {
        String email = authentication.getName();
        String cfHandle = userService.getCfHandleByEmail(email); // ✅ email → cfHandle
        return matchService.createMatch(cfHandle);
    }

    @PostMapping("/join")
    public Match join(Authentication authentication,
                      @RequestParam String inviteCode) {
        String email = authentication.getName();
        String cfHandle = userService.getCfHandleByEmail(email); // ✅ email → cfHandle
        return matchService.joinMatch(cfHandle, inviteCode);
    }
}