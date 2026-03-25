package CF_DuelProject.CF_DuelProject.service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.sql.Date;

import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final String SECRET = "this_is_a_very_long_secret_key_12345678901234567890";
    public String generateToken(String email) {
        return Jwts.builder()
        .setSubject(email)
        .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
        .compact();
    }
    public String extractEmail(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
