package CF_DuelProject.CF_DuelProject.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import CF_DuelProject.CF_DuelProject.model.Match;
import CF_DuelProject.CF_DuelProject.repository.MatchRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final MatchRepository matchRepository;

    @GetMapping("/test")
    public List<Match> test() {
        return matchRepository.findAll();
    }
}