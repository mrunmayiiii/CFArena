package CF_DuelProject.CF_DuelProject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class SolveResult {
    private String winner;
    private Date solvedAt;
}