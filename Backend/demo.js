// smartapi.module.js
import dotenv from "dotenv";
import axios from "axios";
import WebSocket from "ws";
import { authenticator } from "otplib";
import winston from "winston";

// Load env variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// Validate environment variables
const API_KEY = process.env.ANGLE_ONE_API_KEY;
const CLIENT_CODE = process.env.ANGLE_ONE_CLIENT_CODE;
const PIN = process.env.ANGLE_ONE_PIN;
const TOTP_SECRET = process.env.ANGLE_ONE_TOTP;

if (!API_KEY || !CLIENT_CODE || !PIN || !TOTP_SECRET) {
  logger.error("Missing required environment variables");
  process.exit(1);
}

const BASE_URL = "https://apiconnect.angelbroking.com";
const LOGIN_URL = `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`;
const FEED_TOKEN_URL = `${BASE_URL}/rest/secure/angelbroking/user/v1/getFeedToken`;
const WS_URL = "wss://smartapisocket.angelone.in/smart-stream";

const COMMON_HEADERS = {
  "Content-Type": "application/json",
  "X-UserType": "USER",
  "X-SourceID": "WEB",
  "X-ClientLocalIP": "127.0.0.1",
  "X-ClientPublicIP": "127.0.0.1",
  "X-MACAddress": "00:00:00:00:00:00",
  "X-PrivateKey": API_KEY,
};

function generateTOTP() {
  return authenticator.generate(TOTP_SECRET);
}

async function authenticate() {
  try {
    const otp = generateTOTP();
    const response = await axios.post(
      LOGIN_URL,
      {
        clientcode: CLIENT_CODE,
        password: PIN,
        totp: otp,
      },
      { headers: COMMON_HEADERS }
    );

    if (response.data.status !== true) {
      throw new Error(
        `Authentication failed: ${JSON.stringify(response.data)}`
      );
    }

    const { jwtToken, refreshToken } = response.data.data;
    logger.info("✅ Login successful");

    const feedTokenResponse = await axios.get(FEED_TOKEN_URL, {
      headers: {
        ...COMMON_HEADERS,
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    // 🔍 Add this for debugging
    logger.info(
      `Feed token raw response: ${JSON.stringify(feedTokenResponse.data)}`
    );

    if (
      !feedTokenResponse.data ||
      !feedTokenResponse.data.data ||
      !feedTokenResponse.data.data.feedToken
    ) {
      throw new Error(
        `Feed token not found in response: ${JSON.stringify(
          feedTokenResponse.data
        )}`
      );
    }

    const feedToken = feedTokenResponse.data.data.feedToken;

    return { jwtToken, refreshToken, feedToken };
  } catch (error) {
    logger.error(`❌ Authentication error: ${error.message}`);
    process.exit(1);
  }
}

async function startWebSocket(jwtToken, feedToken) {
  const ws = new WebSocket(WS_URL);
  const correlationId = "onkar123";

  const subscriptionPayload = {
    correlationID: correlationId,
    action: 1,
    params: {
      mode: 2,
      tokenList: [
        {
          exchangeType: 1,
          tokens: ["8334", "2885"], // IREDA and RELIANCE
        },
      ],
    },
  };

  ws.on("open", () => {
    logger.info("🔗 WebSocket connected");
    ws.send(JSON.stringify(subscriptionPayload));
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.t && message.t === "tk") return;

      if (message.last_traded_price) {
        const token = message.token;
        const ltp = message.last_traded_price / 100;
        logger.info(`📈 Token: ${token} | LTP: ₹${ltp.toFixed(2)}`);
      } else {
        logger.warn("⚠️ LTP not found in message");
      }
    } catch (error) {
      logger.error(`💥 Error processing message: ${error.message}`);
    }
  });

  ws.on("error", (error) => {
    logger.error(`❌ WebSocket error: ${error.message}`);
  });

  ws.on("close", () => {
    logger.info("🔌 WebSocket connection closed");
  });

  process.on("SIGINT", () => {
    logger.info("🔁 Gracefully closing WebSocket...");
    ws.close();
    process.exit(0);
  });
}

async function main() {
  const { jwtToken, feedToken } = await authenticate();
  await startWebSocket(jwtToken, feedToken);
}

main();
