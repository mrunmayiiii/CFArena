package CF_DuelProject.CF_DuelProject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import CF_DuelProject.CF_DuelProject.service.JwtService;

@Configuration
public class SecurityConfig {
     private final CF_DuelProject.CF_DuelProject.service.JwtService jwtService;
     private final CF_DuelProject.CF_DuelProject.config.JwtFilter jwtFilter;
    SecurityConfig(CF_DuelProject.CF_DuelProject.config.JwtFilter jwtFilter, CF_DuelProject.CF_DuelProject.service.JwtService jwtService) {
        this.jwtFilter = jwtFilter;
        this.jwtService = jwtService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                        OAuth2SuccessHandler handler) throws Exception {

       http
    .csrf(csrf -> csrf.disable())

    .sessionManagement(session -> 
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    )

    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/**", "/oauth2/**", "/ws/**").permitAll()
        .anyRequest().authenticated()
    )

    .oauth2Login(oauth -> oauth
        .successHandler(handler) 
    )

    .exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, exx) -> {
            res.setStatus(401);
            res.getWriter().write("Unauthorized");
        })
    )

    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
   
}
