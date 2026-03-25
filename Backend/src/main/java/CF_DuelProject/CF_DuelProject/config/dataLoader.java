package CF_DuelProject.CF_DuelProject.config;

import CF_DuelProject.CF_DuelProject.model.Match;
import CF_DuelProject.CF_DuelProject.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Date;

@Configuration
@RequiredArgsConstructor
public class dataLoader {

    private final MatchRepository matchRepository;

    @Bean
    CommandLineRunner init() {
        return args -> {

            // avoid duplicate insert
            if (matchRepository.count() > 0) return;

            Match match = new Match();
            match.setUser1("tourist");
            match.setUser2("Petr");
            match.setScore1(0);
            match.setScore2(0);
            match.setCurIdx(0);
            match.setStatus("ONGOING");

            match.setProblems(Arrays.asList(
                    "https://codeforces.com/problemset/problem/1900/A"
            ));

            match.setStartTime(new Date(System.currentTimeMillis() - 1000 * 60)); // started 1 min ago
            match.setEndTime(new Date(System.currentTimeMillis() + 1000 * 60 * 60)); // +1 hour

            matchRepository.save(match);

            System.out.println("✅ Dummy match inserted");
        };
    }
}