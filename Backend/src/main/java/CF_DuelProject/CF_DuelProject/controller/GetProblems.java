package CF_DuelProject.CF_DuelProject.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import CF_DuelProject.CF_DuelProject.service.ProblemService;

@RestController
@RequestMapping("/getProblems")
public class GetProblems {
    private final ProblemService problemService;
    public GetProblems(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping("/{u1}/{u2}")
    public List<String> getProblems(@PathVariable String u1,@PathVariable String u2) {
        return problemService.getMatchProblems(u1,u2,"EASY");
    }
}
