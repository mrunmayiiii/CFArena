package CF_DuelProject.CF_DuelProject.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import CF_DuelProject.CF_DuelProject.model.User;
import CF_DuelProject.CF_DuelProject.repository.UserRepository;
import CF_DuelProject.CF_DuelProject.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtService jwtService;

    @Override
public void onAuthenticationSuccess(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Authentication authentication) throws IOException {

    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

    String email = oAuth2User.getAttribute("email");
    String name = oAuth2User.getAttribute("name");

    User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User u = new User();
                u.setEmail(email);
                u.setName(name);
                u.setProvider("GOOGLE");
                return userRepository.save(u);
            });

    String token = jwtService.generateToken(email);
    System.out.println("JWT Token: " + token);
    
    String frontendUrl = System.getenv("FRONTEND_URL");
    if (frontendUrl == null || frontendUrl.isEmpty()) {
        frontendUrl = "http://localhost:5173";
    }

    String redirectUrl = frontendUrl + "/auth/callback?token=" + token;
    
    //String frontendUrl = System.getenv("FRONTEND_URL");
    //res.sendRedirect(frontendUrl + "/auth/callback?token=" + token);    
    // ✅ Use this instead of response.sendRedirect
    getRedirectStrategy().sendRedirect(request, response, redirectUrl);
}
}