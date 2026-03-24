package CF_DuelProject.CF_DuelProject.dto;

public class Submission {
    public String verdict;
    public ProblemInfo problem;
    public String getVerdict() {
        return verdict;
    }
    public void setVerdict(String verdict) {
        this.verdict = verdict;
    }
    public ProblemInfo getProblem() {
        return problem;
    }
    public void setProblem(ProblemInfo problem) {
        this.problem = problem;
    }
}
