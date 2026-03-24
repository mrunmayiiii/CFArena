package CF_DuelProject.CF_DuelProject.dto;

import lombok.Data;

@Data
public class RegisterRequest {
     private String name;
    private String email;
    private String password;
    private String cfHandle;
}
