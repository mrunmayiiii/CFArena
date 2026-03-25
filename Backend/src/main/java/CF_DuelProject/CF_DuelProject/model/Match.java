package CF_DuelProject.CF_DuelProject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "matches")
public class Match {
  
    @Id
    private String id;

    private String user1;
    private String user2;
    private int score1;
    private int score2;
    private List<String> problems;
    private int curIdx;
    private String status; 
    private String winnerId;
    private Date startTime;
    private Date endTime;
    private String inviteCode;

}
