package CF_DuelProject.CF_DuelProject.repository;

import CF_DuelProject.CF_DuelProject.model.MatchPrimary;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PrimaryMatchRepository extends MongoRepository<MatchPrimary, String> {

    List<MatchPrimary> findByStatus(String status);
    Optional<MatchPrimary> findByInviteCode(String inviteCode);
}