package CF_DuelProject.CF_DuelProject.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import CF_DuelProject.CF_DuelProject.model.MatchPrimary;
import CF_DuelProject.CF_DuelProject.repository.PrimaryMatchRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final PrimaryMatchRepository matchRepository;

    @GetMapping("/test")
    public List<MatchPrimary> test() {
        return matchRepository.findAll();
    }
}