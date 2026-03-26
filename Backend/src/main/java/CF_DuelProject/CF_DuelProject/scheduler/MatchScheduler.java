package CF_DuelProject.CF_DuelProject.scheduler;

import CF_DuelProject.CF_DuelProject.model.Match;
import CF_DuelProject.CF_DuelProject.repository.MatchRepository;
import CF_DuelProject.CF_DuelProject.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MatchScheduler {

    private final MatchRepository matchRepository;
    private final MatchService matchService;

    @Scheduled(fixedRate = 5000)
    public void runScheduler() {

        List<Match> matches = matchRepository.findByStatus("ONGOING");
        System.out.println("===== Scheduler Tick =====");
            for (Match match : matches) {
            matchService.processMatch(match);
        }
    }
}