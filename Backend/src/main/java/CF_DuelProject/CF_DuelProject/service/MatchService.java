package CF_DuelProject.CF_DuelProject.service;

import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongodb.client.result.UpdateResult;

import CF_DuelProject.CF_DuelProject.dto.SolveResult;
import CF_DuelProject.CF_DuelProject.model.MatchPrimary;
import CF_DuelProject.CF_DuelProject.model.MatchSecondary;
import CF_DuelProject.CF_DuelProject.repository.PrimaryMatchRepository;
import CF_DuelProject.CF_DuelProject.repository.SecondaryMatchRepository;
import lombok.RequiredArgsConstructor;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final PrimaryMatchRepository matchRepository;
    private final SecondaryMatchRepository matchRepository2;
    private final MongoTemplate mongoTemplate;
    private final CodeforcesService codeforcesService;
    private final ProblemService problemService;
    private final SimpMessagingTemplate messagingTemplate;


    // 📡 WebSocket: publish match update to frontend
    private void publishMatchUpdate(MatchPrimary match) {
        System.out.println("📡 WebSocket SEND → /topic/match/" + match.getId() + " | Score: " + match.getScore1() + "-" + match.getScore2());
        messagingTemplate.convertAndSend("/topic/match/" + match.getId(), match);
        // Also publish to invite code topic so clients can subscribe by invite code
        if (match.getInviteCode() != null) {
            messagingTemplate.convertAndSend("/topic/match/" + match.getInviteCode(), match);
        }
    }

    // 🚀 MAIN LOGIC
    public void processMatch(MatchPrimary match) {

        // ⏱ check match end
        if (new Date().after(match.getEndTime())) {
            finishMatch(match.getId());
            return;
        }

        int idx = match.getCurIdx();

        if (idx >= match.getProblems().size()) {
            finishMatch(match.getId());
            return;
        }

        String problem = match.getProblems().get(idx);

        System.out.println("Checking Problem: " + problem);

        SolveResult result = checkSolve(
                match.getUser1(),
                match.getUser2(),
                problem,
                match
        );

        if (result == null) {
            System.out.println("No one solved yet");
            return;
        }

        String winner = result.getWinner();
        System.out.println("Winner: " + winner);

        // 🔥 ATOMIC UPDATE
        boolean success = tryUpdateMatch(
                match.getId(),
                match.getCurIdx(),
                winner,
                match
        );

        if (success) {
            System.out.println("✅ Winner locked: " + winner);
            // 📡 Fetch latest and publish via WebSocket
            MatchPrimary latest = matchRepository.findById(match.getId()).orElse(null);
            if (latest != null) {
                publishMatchUpdate(latest);
            }
        } else {
            System.out.println("❌ Race lost");
        }
    }

    private SolveResult checkSolve(String user1, String user2, String problem, MatchPrimary match) {

        Date t1 = codeforcesService.getSolveTime(user1, problem, match.getStartTime());
        Date t2 = codeforcesService.getSolveTime(user2, problem, match.getStartTime());

        if (t1 == null && t2 == null) return null;

        if (t1 != null && t2 == null) return new SolveResult(user1, t1);
        if (t1 == null && t2 != null) return new SolveResult(user2, t2);

        return t1.before(t2)
                ? new SolveResult(user1, t1)
                : new SolveResult(user2, t2);
    }

    // 🔥 ATOMIC UPDATE (prevents race conditions)
    private boolean tryUpdateMatch(String matchId, int expectedIdx, String winner, MatchPrimary match) {

        Query query = new Query();
        query.addCriteria(Criteria.where("_id").is(matchId));
        query.addCriteria(Criteria.where("curIdx").is(expectedIdx));

        Update update = new Update();

        if (winner.equals(match.getUser1())) {
            update.inc("score1", 1);
            update.set("player1Results." + expectedIdx, "SOLVED");
            update.set("player2Results." + expectedIdx, "—");
        } else {
            update.inc("score2", 1);
            update.set("player2Results." + expectedIdx, "SOLVED");
            update.set("player1Results." + expectedIdx, "—");
        }

        update.inc("curIdx", 1);

        UpdateResult result = mongoTemplate.updateFirst(query, update, MatchPrimary.class);

        return result.getModifiedCount() > 0;
    }

    // @Transactional
private void finishMatch(String matchId) {

        MatchPrimary match = matchRepository.findById(matchId).orElse(null);
        if (match == null) return;

        if ("FINISHED".equals(match.getStatus())) return;

        System.out.println("🏁 Match Finished: " + match.getId());

        String winner;
        if (match.getScore1() > match.getScore2()) {
            winner = match.getUser1();
        } else if (match.getScore2() > match.getScore1()) {
            winner = match.getUser2();
        } else {
            winner = "DRAW";
        }

        // 🔥 CREATE SECONDARY ENTRY
        MatchSecondary newMatch = new MatchSecondary();

        newMatch.setUser1(match.getUser1());
        newMatch.setUser2(match.getUser2());

        newMatch.setScore1(match.getScore1());
        newMatch.setScore2(match.getScore2());

        newMatch.setProblems(match.getProblems());
        newMatch.setCurIdx(match.getCurIdx());

        newMatch.setStatus("FINISHED");
        newMatch.setWinnerId(winner);

        newMatch.setStartTime(match.getStartTime());
        newMatch.setEndTime(match.getEndTime());

        newMatch.setInviteCode(match.getInviteCode());
        newMatch.setPlayer1Results(match.getPlayer1Results());
    newMatch.setPlayer2Results(match.getPlayer2Results());
        // save to secondary
        MatchSecondary saved = matchRepository2.save(newMatch);

        // delete from primary
        
        publishMatchUpdate(match); 
        matchRepository.delete(match);
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
    public MatchSecondary createMatch(String userId, int durationMinutes) {

        MatchSecondary match = new MatchSecondary();

        match.setUser1(userId);
        match.setScore1(0);
        match.setScore2(0);
        match.setCurIdx(0);

        match.setStatus("WAITING");
        match.setInviteCode(generateCode());

        match.setStartTime(null);
        match.setEndTime(null);

        // store duration temporarily in endTime later
        match.setEndTime(new Date(durationMinutes * 60 * 1000)); // temp storage trick

        return matchRepository2.save(match);
    }

    public MatchSecondary joinMatch(String userId, String inviteCode) {

    MatchSecondary match = matchRepository2.findByInviteCode(inviteCode)
            .orElseThrow(() -> new RuntimeException("Invalid invite code"));

    if (match.getUser2() != null) {
        throw new RuntimeException("Match already full");
    }

    if (match.getUser1().equals(userId)) {
        throw new RuntimeException("Cannot join your own match");
    }

    match.setUser2(userId);

    // 🔥 IMPORTANT
    match.setStatus("READY");

    MatchSecondary saved = matchRepository2.save(match);
    // publishMatchUpdate(saved);

    return saved;
    }


    public MatchPrimary startMatch(String userId, String inviteCode) {

        MatchSecondary match = matchRepository2.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid code"));

        if (!userId.equals(match.getUser1())) {
            throw new RuntimeException("Only creator can start");
        }

        if (!"READY".equals(match.getStatus())) {
            throw new RuntimeException("Player 2 not joined/ready");
        }

        Date startTime = new Date();

        long durationMillis = match.getEndTime().getTime();
        Date endTime = new Date(startTime.getTime() + durationMillis);

        List<String> problems = problemService.getMatchProblems(
                match.getUser1(),
                match.getUser2()
        );

        MatchPrimary newMatch = new MatchPrimary();

        newMatch.setUser1(match.getUser1());
        newMatch.setUser2(match.getUser2());

        newMatch.setScore1(0);
        newMatch.setScore2(0);

        newMatch.setProblems(problems);
        newMatch.setCurIdx(0);

        newMatch.setStatus("ONGOING");
        newMatch.setWinnerId(null);

        newMatch.setStartTime(startTime);
        newMatch.setEndTime(endTime);

        newMatch.setInviteCode(match.getInviteCode());
        MatchPrimary saved = matchRepository.save(newMatch);
        matchRepository2.delete(match);
        publishMatchUpdate(saved);
        return saved;
    }

    public Map<String, Object> getMatchStatus(String inviteCode) {
        String normalizedCode = inviteCode == null ? "" : inviteCode.trim();

        Optional<MatchPrimary> primary = matchRepository.findByInviteCode(normalizedCode);
        if (primary.isPresent()) {
            MatchPrimary m = primary.get();
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("source", "PRIMARY");
            payload.put("id", m.getId());
            payload.put("inviteCode", m.getInviteCode());
            payload.put("status", m.getStatus());
            payload.put("user1", m.getUser1());
            payload.put("user2", m.getUser2());
            payload.put("score1", m.getScore1());
            payload.put("score2", m.getScore2());
            payload.put("curIdx", m.getCurIdx());
            payload.put("winnerId", m.getWinnerId());
            payload.put("problems", m.getProblems());
            payload.put("startTime", m.getStartTime());
            payload.put("endTime", m.getEndTime());
            payload.put("player1Results", m.getPlayer1Results());
            payload.put("player2Results", m.getPlayer2Results());
            return payload;
        }

        Optional<MatchSecondary> secondary = matchRepository2.findByInviteCode(normalizedCode);
        if (secondary.isPresent()) {
            MatchSecondary m = secondary.get();
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("source", "SECONDARY");
            payload.put("id", m.getId());
            payload.put("inviteCode", m.getInviteCode());
            payload.put("status", m.getStatus());
            payload.put("user1", m.getUser1());
            payload.put("user2", m.getUser2());
            payload.put("score1", m.getScore1());
            payload.put("score2", m.getScore2());
            payload.put("curIdx", m.getCurIdx());
            payload.put("winnerId", m.getWinnerId());
            payload.put("problems", m.getProblems());
            payload.put("startTime", m.getStartTime());
            payload.put("endTime", m.getEndTime());
            payload.put("player1Results", m.getPlayer1Results());
            payload.put("player2Results", m.getPlayer2Results());
       
            return payload;
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found for invite code");
    }

}
