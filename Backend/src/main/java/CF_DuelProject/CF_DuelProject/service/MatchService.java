package CF_DuelProject.CF_DuelProject.service;

import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.mongodb.client.result.UpdateResult;

import CF_DuelProject.CF_DuelProject.dto.SolveResult;
import CF_DuelProject.CF_DuelProject.model.Match;
import CF_DuelProject.CF_DuelProject.repository.MatchRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MongoTemplate mongoTemplate;
    private final CodeforcesService codeforcesService;
    private final ProblemService problemService;
    private final SimpMessagingTemplate messagingTemplate;

    // 📡 WebSocket: publish match update to frontend
    private void publishMatchUpdate(Match match) {
        System.out.println("📡 WebSocket SEND → /topic/match/" + match.getId() + " | Score: " + match.getScore1() + "-" + match.getScore2());
        messagingTemplate.convertAndSend("/topic/match/" + match.getId(), match);
        // Also publish to invite code topic so clients can subscribe by invite code
        if (match.getInviteCode() != null) {
            messagingTemplate.convertAndSend("/topic/match/" + match.getInviteCode(), match);
        }
    }

    // 🚀 MAIN LOGIC
    public void processMatch(Match match) {

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
            Match latest = matchRepository.findById(match.getId()).orElse(null);
            if (latest != null) {
                publishMatchUpdate(latest);
            }
        } else {
            System.out.println("❌ Race lost");
        }
    }

    private SolveResult checkSolve(String user1, String user2, String problem, Match match) {

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
    private boolean tryUpdateMatch(String matchId, int expectedIdx, String winner, Match match) {

        Query query = new Query();
        query.addCriteria(Criteria.where("_id").is(matchId));
        query.addCriteria(Criteria.where("curIdx").is(expectedIdx));

        Update update = new Update();

        if (winner.equals(match.getUser1())) {
            update.inc("score1", 1);
        } else {
            update.inc("score2", 1);
        }

        update.inc("curIdx", 1);

        UpdateResult result = mongoTemplate.updateFirst(query, update, Match.class);

        return result.getModifiedCount() > 0;
    }

    // 🏁 Finish match (safer: re-fetches from DB)
    private void finishMatch(String matchId) {

        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) return;

        if ("FINISHED".equals(match.getStatus())) return;

        System.out.println("🏁 Match Finished: " + match.getId());

        if (match.getScore1() > match.getScore2()) {
            match.setWinnerId(match.getUser1());
        } else if (match.getScore2() > match.getScore1()) {
            match.setWinnerId(match.getUser2());
        } else {
            match.setWinnerId("DRAW");
        }

        match.setStatus("FINISHED");

        matchRepository.save(match);
        publishMatchUpdate(match);  // 📡 Notify frontend match is done
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
    public Match createMatch(String userId, int durationMinutes) {

        Match match = new Match();

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

    // 🔥 IMPORTANT
    match.setStatus("READY");

    Match saved = matchRepository.save(match);
    publishMatchUpdate(saved);

    return saved;
    }


    public Match startMatch(String userId, String inviteCode) {

    Match match = matchRepository.findByInviteCode(inviteCode)
            .orElseThrow(() -> new RuntimeException("Invalid code"));

    if (!userId.equals(match.getUser1())) {
        throw new RuntimeException("Only creator can start");
    }

    if (!"READY".equals(match.getStatus())) {
        throw new RuntimeException("Player 2 not joined/ready");
    }

    // 🔥 NOW START
    Date startTime = new Date();
    match.setStartTime(startTime);

    long durationMillis = match.getEndTime().getTime();
    Date endTime = new Date(startTime.getTime() + durationMillis);

    match.setEndTime(endTime);

    match.setStatus("ONGOING");

    List<String> problems = problemService.getMatchProblems(
            match.getUser1(),
            match.getUser2()
    );

    match.setProblems(problems);
    match.setCurIdx(0);

    Match saved = matchRepository.save(match);
    publishMatchUpdate(saved);

    return saved;
    
    }

}
