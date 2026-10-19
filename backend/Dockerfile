FROM gradle:8.12-jdk17 AS build
WORKDIR /src
COPY . .
RUN gradle :server:installDist --no-daemon
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /src/server/build/install/server/ ./
EXPOSE 8080
CMD ["bin/server"]
