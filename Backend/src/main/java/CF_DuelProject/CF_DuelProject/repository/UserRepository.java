package CF_DuelProject.CF_DuelProject.repository;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

import CF_DuelProject.CF_DuelProject.model.User;   


public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);
} 
