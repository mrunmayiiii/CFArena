package CF_DuelProject.CF_DuelProject.controller;

import java.io.Console;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import CF_DuelProject.CF_DuelProject.dto.CreateMatchRequest;
import CF_DuelProject.CF_DuelProject.model.MatchPrimary;
import CF_DuelProject.CF_DuelProject.model.MatchSecondary;
import CF_DuelProject.CF_DuelProject.service.MatchService;
import CF_DuelProject.CF_DuelProject.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("api/match")
public class MatchController {

    private final MatchService matchService;
    private final UserService userService;

    public MatchController(MatchService matchService, UserService userService) {
        this.matchService = matchService;
        this.userService = userService;
    }

    // ✅ CREATE
    @PostMapping("/create")
    public MatchSecondary create(Authentication authentication,
                        @RequestBody CreateMatchRequest req) {

        String email = authentication.getName();
        String cfHandle = userService.getCfHandleByEmail(email);

        return matchService.createMatch(cfHandle, req.duration,req.difficulty);
    }

    // ✅ JOIN (auto READY)
    @PostMapping("/join")
    public MatchSecondary join(Authentication authentication,
                      @RequestParam String inviteCode) {

        // System.out.println("Params: " + request.getQueryString());
        String email = authentication.getName();
        String cfHandle = userService.getCfHandleByEmail(email);

        return matchService.joinMatch(cfHandle, inviteCode);
    }

    // 🟢 START (Player 1 clicks button)
    @PostMapping("/start")
    public MatchPrimary start(Authentication authentication,
                       @RequestParam String inviteCode) {

        String email = authentication.getName();
        String cfHandle = userService.getCfHandleByEmail(email);

        return matchService.startMatch(cfHandle, inviteCode);
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus(@RequestParam String inviteCode) {
        return matchService.getMatchStatus(inviteCode);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getMatchHistory(@PathVariable String userId) {
        System.out.println("Fetching History API for User: " + userId);
        return ResponseEntity.ok(matchService.getUserMatchHistory(userId));
    }

}