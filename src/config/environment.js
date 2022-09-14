const environment = {
  port: parseInt(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || "production",
  saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
  jwtAccessTokenSecret:
    process.eventNames.JWT_ACCESS_TOKEN_SECRET ||
    "356af4d2dec83780a27ca8b58533b073a62cc2c4fb1d908b2b478b51e0adba51a2e21df9addee2d025bc8388d657b5b753fba93fe7110dea155135d88819b883",
  jwtRefreshTokenSecret:
    process.env.JWT_REFRESH_TOKEN_SECRET ||
    "33b216033ea7b1ec1b8140e84419e0039e29ad8617e76e506c51bfa16289c42dad30eebf3e97c04957a3603b9e468b9296905aa7b09563351954bf1c9b5cfbdb",
};

export default environment;
