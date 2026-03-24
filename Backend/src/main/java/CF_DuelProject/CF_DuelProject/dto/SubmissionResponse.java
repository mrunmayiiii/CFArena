package CF_DuelProject.CF_DuelProject.dto;

import java.util.List;

public class SubmissionResponse {
    public String status;
    public List<Submission> result;
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public List<Submission> getResult() {
        return result;
    }
    public void setResult(List<Submission> result) {
        this.result = result;
    }
}
