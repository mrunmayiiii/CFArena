package CF_DuelProject.CF_DuelProject.repository;

import CF_DuelProject.CF_DuelProject.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends MongoRepository<Match, String> {

    List<Match> findByStatus(String status);
    Optional<Match> findByInviteCode(String inviteCode);
}