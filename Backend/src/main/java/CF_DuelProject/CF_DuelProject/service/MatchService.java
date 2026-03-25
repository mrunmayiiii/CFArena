package CF_DuelProject.CF_DuelProject.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import CF_DuelProject.CF_DuelProject.model.Match;
import CF_DuelProject.CF_DuelProject.repository.MatchRepository;

@Service
public class MatchService {
    @Autowired
    MatchRepository matchRepository;
    @Autowired
    ProblemService problemService;

    public MatchService(MatchRepository matchRepository, ProblemService problemService) {
        this.matchRepository = matchRepository;
        this.problemService = problemService;
    }

    public String generateCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            int idx = (int)(Math.random() * chars.length());
            code.append(chars.charAt(idx));
        }

        return code.toString();
    }

    // ✅ Create Match
    public Match createMatch(String userId) {
        Match match = new Match();
        match.setUser1(userId);
        match.setScore1(0);
        match.setScore2(0);
        match.setCurIdx(0);
        match.setStatus("WAITING");
        match.setInviteCode(generateCode());


        return matchRepository.save(match);
    }

     public Match joinMatch(String userId, String inviteCode) {

        Match match = matchRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (match.getUser2() != null) {
            throw new RuntimeException("Match already full");
        }

        if (match.getUser1().equals(userId)) {
            throw new RuntimeException("Cannot join your own match");
        }

        match.setUser2(userId);
        match.setStartTime(new Date());
        match.setStatus("STARTED");

        List<String> problems = problemService.getMatchProblems(
                match.getUser1(),
                userId
        );

        match.setProblems(problems);
        match.setCurIdx(0);

        return matchRepository.save(match);
    }

}
