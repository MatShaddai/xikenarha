const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add CORS configuration for Tempo development environment
config.server = {
  ...config.server,
  cors: {
    origin: [
      "https://app.tempo.new",
      "https://beautiful-cohen5-fce4b.view-3.tempo-dev.app",
      "http://localhost:8081",
      "http://localhost:19006",
    ],
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
