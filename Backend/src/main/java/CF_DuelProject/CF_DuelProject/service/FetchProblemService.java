package CF_DuelProject.CF_DuelProject.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import CF_DuelProject.CF_DuelProject.dto.Submission;
import CF_DuelProject.CF_DuelProject.dto.SubmissionResponse;
import CF_DuelProject.CF_DuelProject.model.Problem;
import jakarta.annotation.PostConstruct;

@Service
public class FetchProblemService {
    private Map<Integer, List<Problem>> ratingMap = new HashMap<>();
    public Map<Integer, List<Problem>> getRatingMap() {
        return ratingMap;
    }

    @PostConstruct
    public void loadProblems() {
        try {
            ObjectMapper mapper = new ObjectMapper();

            InputStream is = getClass()
                .getClassLoader()
                .getResourceAsStream("problems.json");

            Map<String, List<Problem>> temp =
                mapper.readValue(is, new TypeReference<>() {});

            for (String key : temp.keySet()) {
                ratingMap.put(Integer.parseInt(key), temp.get(key));
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to load problems.json", e);
        }
    }

    public List<Problem> getShuffledProblems(int rating) {
        List<Problem> list = ratingMap.get(rating);
        if (list == null) return List.of();

        List<Problem> copy = new ArrayList<>(list);
        Collections.shuffle(copy);
        return copy;
    }

    public Set<String> fetchSolved(String handle) {
        String url = "https://codeforces.com/api/user.status?handle=" + handle;
        RestTemplate restTemplate = new RestTemplate();
        SubmissionResponse response =
            restTemplate.getForObject(url, SubmissionResponse.class);

        Set<String> solved = new HashSet<>();

        if (response != null && response.result != null) {
            for (Submission sub : response.result) {
                if ("OK".equals(sub.verdict)) {
                    int cid = sub.problem.contestId;
                    String idx = sub.problem.index;

                    solved.add(cid + "-" + idx);
                }
            }
        }

        return solved;
    }
}
