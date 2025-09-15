import axios from "axios";
import WebSocket from "ws";
import fetch from "node-fetch";
import { networkInterfaces } from "os";
import { TOTP } from "totp-generator";
import mongoose from "mongoose";
import MarketData from "../Models/MarketData.models.js";
import DailyData from "../Models/DailyData.models.js";

/* -------------------- globals -------------------- */
let ws = null;
let globalJwt = null;  // store latest JWT for reuse
let globalFeed = null;
const aggCache = {};
const tokenToSymbol = {
  "3045": "RELIANCE",
  "1594": "INFY",
  "1660": "TCS",
};

/* -------------------- helpers -------------------- */
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if ((net.family === "IPv4" || net.family === 4) && !net.internal)
        return net.address;
    }
  }
  return "127.0.0.1";
}
function getMacAddress() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.mac && net.mac !== "00:00:00:00:00:00") return net.mac;
    }
  }
  return "00:00:00:00:00:00";
}
async function getPublicIP() {
  const res = await fetch("https://api64.ipify.org?format=json");
  const data = await res.json();
  return data.ip;
}

/* -------------------- login -------------------- */
async function login() {
  const localIP = getLocalIP();
  const mac = getMacAddress();
  const publicIP = await getPublicIP();

  const TOTP_SECRET = process.env.ANGLE_ONE_TOTP;
  const CLIENT_CODE = process.env.ANGLE_ONE_CLIENT_CODE;
  const PASSWORD = process.env.ANGLE_ONE_PIN;
  const API_KEY = process.env.ANGLE_ONE_API_KEY;

  const otp = TOTP.generate(TOTP_SECRET).otp;

  const payload = {
    clientcode: CLIENT_CODE,
    password: PASSWORD,
    totp: otp,
    state: "onkar",
  };

  const cfg = {
    method: "post",
    url: "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": localIP,
      "X-ClientPublicIP": publicIP,
      "X-MACAddress": mac,
      "X-PrivateKey": API_KEY,
    },
    data: JSON.stringify(payload),
  };

  try {
    const res = await axios(cfg);
    const d = res.data?.data || {};
    const jwtToken = d.jwtToken;
    const feedToken = d.feedToken;
    const clientcodeFromResp = d.clientcode || d.clientCode || CLIENT_CODE;

    if (!jwtToken || !feedToken) {
      console.error("Login response missing tokens:", res.data);
      return;
    }

    // save globally
    globalJwt = jwtToken;
    globalFeed = feedToken;

    console.log("✅ Login Success");
    startWebSocket({
      jwtToken,
      feedToken,
      clientcode: clientcodeFromResp,
      apiKey: API_KEY,
    });
  } catch (err) {
    console.error("❌ Login Error:", err.response?.data || err.message);
  }
}

/* -------------------- websocket + aggregation -------------------- */
function startWebSocket({ jwtToken, feedToken, clientcode, apiKey }) {
  const wsUrl = "wss://smartapisocket.angelone.in/smart-stream";

  ws = new WebSocket(wsUrl, {
    headers: {
      Authorization: jwtToken,
      "x-api-key": apiKey,
      "x-client-code": clientcode,
      "x-feed-token": feedToken,
    },
  });

  ws.on("open", () => {
    console.log("🔗 WebSocket Connected");

    const sub = {
      correlationID: "sub-ohlc-1",
      action: 1,
      params: {
        mode: 2,
        tokenList: [{ exchangeType: 1, tokens: Object.keys(tokenToSymbol) }],
      },
    };
    ws.send(JSON.stringify(sub));
    console.log("📡 Subscribed:", JSON.stringify(sub));

    const hb = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send("ping");
    }, 30000);
    ws.on("close", () => clearInterval(hb));
  });

  ws.on("message", (data, isBinary) => {
    if (!isBinary) return;
    const buf = Buffer.from(data);
    const parsed = parsePacket(buf);
    if (!parsed) return;

    const symbol = tokenToSymbol[parsed.token] || parsed.token;
    const ts = Math.floor(parsed.exchTs / 1000) * 1000;
    const price = parsed.ltp;

    if (!aggCache[symbol] || aggCache[symbol].secondTs !== ts) {
      aggCache[symbol] = {
        secondTs: ts,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: parsed.volume || 0,
      };
    } else {
      const c = aggCache[symbol];
      c.high = Math.max(c.high, price);
      c.low = Math.min(c.low, price);
      c.close = price;
      c.volume += parsed.volume || 0;
    }
  });

  ws.on("close", async () => {
    console.log("🔌 WebSocket closed, running daily aggregation...");
    await aggregateDaily();
  });

  ws.on("error", (err) => console.error("❌ WebSocket error:", err?.message));
}

/* -------------------- save loop (1 sec) -------------------- */
setInterval(async () => {
  const now = Date.now();
  const cutoff = now - 1000;

  for (const [symbol, c] of Object.entries(aggCache)) {
    if (c.secondTs <= cutoff) {
      try {
        const doc = new MarketData({
          Symbol: symbol,
          Date: new Date(c.secondTs),
          Open: c.open,
          High: c.high,
          Low: c.low,
          Close: c.close,
          Volume: c.volume,
        });
        await doc.save();
        console.log(`💾 Saved ${symbol} @ ${new Date(c.secondTs).toLocaleTimeString()}`);
        delete aggCache[symbol];
      } catch (err) {
        console.error("❌ DB Save error:", err.message);
      }
    }
  }
}, 1000);

/* -------------------- daily aggregation -------------------- */
async function aggregateDaily() {
  console.log("📊 Aggregating daily data...");

  const pipeline = [
    {
      $group: {
        _id: "$Symbol",
        Date: { $first: "$Date" },
        Open: { $first: "$Open" },
        High: { $max: "$High" },
        Low: { $min: "$Low" },
        Close: { $last: "$Close" },
        Volume: { $sum: "$Volume" },
      },
    },
  ];

  const daily = await MarketData.aggregate(pipeline);
  for (const d of daily) {
    const doc = new DailyData({
      Symbol: d._id,
      Date: new Date(d.Date.setHours(0, 0, 0, 0)),
      Open: d.Open,
      High: d.High,
      Low: d.Low,
      Close: d.Close,
      Volume: d.Volume,
    });
    await doc.save();
  }

  await MarketData.deleteMany({});
  console.log("✅ Daily aggregation done & intraday cleared");
}

/* -------------------- parser -------------------- */
function parsePacket(buf) {
  if (!Buffer.isBuffer(buf)) return null;
  if (buf.length < 51) return null;

  let o = 0;
  const mode = buf.readInt8(o); o += 1;
  const exchangeType = buf.readInt8(o); o += 1;

  const tokenBytes = buf.slice(o, o + 25);
  const token = tokenBytes.toString("utf8").replace(/\0/g, ""); o += 25;

  const seqNo = Number(buf.readBigInt64LE(o)); o += 8;
  const exchTs = Number(buf.readBigInt64LE(o)); o += 8;

  const ltpPaise = buf.readInt32LE(o); o += 4;
  const ltp = ltpPaise / 100.0;

  return { mode, exchangeType, token, seqNo, exchTs, ltp };
}

/* -------------------- scheduler -------------------- */
function scheduleMarketHours() {
  const now = new Date();
  const start = new Date(now); start.setHours(9, 15, 0, 0);
  const end = new Date(now); end.setHours(15, 30, 0, 0);

  if (now < start) {
    const ms = start - now;
    console.log(`⏳ Waiting for market open (${ms / 1000 / 60} min)`);
    setTimeout(() => login(), ms);
  } else if (now >= start && now <= end) {
    console.log("🟢 Market already open, starting now...");
    login();
  }

  const msToEnd = end - now;
  if (msToEnd > 0) {
    setTimeout(() => {
      console.log("🛑 Market close reached, closing socket...");
      if (ws) ws.close();
    }, msToEnd);
  }
}

/* -------------------- Top gainers/losers API -------------------- */
const TopGainersLosers = async (req, res) => {
  try {
    const { type } = req.params; // 'gainers' or 'losers'

    if (!["gainers", "losers"].includes(type)) {
      return res.status(400).json({ error: "Invalid type. Use 'gainers' or 'losers'." });
    }

    if (!globalJwt) {
      return res.status(401).json({ error: "Not logged in. Please wait for login." });
    }

    const API_KEY = process.env.ANGLE_ONE_API_KEY;
    const url = "https://apiconnect.angelone.in/rest/secure/angelbroking/marketData/v1/gainersLosers";

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${globalJwt}`,
        "X-PrivateKey": API_KEY,
      },
      params: {
        type: type, // "gainers" or "losers"
      },
    });

    return res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching Top Gainers/Losers:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch gainers/losers" });
  }
};

/* -------------------- run -------------------- */
scheduleMarketHours();

export { TopGainersLosers };
