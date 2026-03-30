package CF_DuelProject.CF_DuelProject.repository;

import CF_DuelProject.CF_DuelProject.model.MatchSecondary;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SecondaryMatchRepository extends MongoRepository<MatchSecondary, String> {
    List<MatchSecondary> findByStatus(String status);
    Optional<MatchSecondary> findByInviteCode(String inviteCode);
}