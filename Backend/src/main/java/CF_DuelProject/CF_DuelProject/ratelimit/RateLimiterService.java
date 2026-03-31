package CF_DuelProject.CF_DuelProject.ratelimit;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.*;

@Service
public class RateLimiterService {
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    public Bucket resolveBucket(String key, long capacity, long refillTokens, Duration duration) {
        return cache.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.builder()
                    .capacity(capacity)
                    .refillGreedy(refillTokens, duration)
                    .build();
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        });
    }
}