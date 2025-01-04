import express from "express";
import crypto from "crypto";
import { exec } from "child_process";
import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

const app = express();
const secret = process.env.WEB_HOOK_SECRET!;
app.use(express.json());

app.post("/", (req, res) => {
  const signature = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex")}`;

  if (req.headers["x-hub-signature-256"] === signature) {
    exec(
      "cd ~/icyHorizonsDeploy/client && git stash && git pull && npm i && npm run build && pm2 restart client",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error: ${stderr}`);
          return res.status(500).send("Error");
        }
        console.log(`Output: ${stdout}`);
        res.status(200).send("Success");
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.get("/", (req, res) => {
  res.send("WEB HOOK SERVER STARTED SUCCESSFULLY");
});

app.listen(process.env.PORT, () =>
  console.log(`Webhook listener running on port ${process.env.PORT}`)
);
