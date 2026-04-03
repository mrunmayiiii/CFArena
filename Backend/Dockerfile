FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy backend only
COPY Backend /app

# Move into correct directory
WORKDIR /app

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]