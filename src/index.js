import cors from "cors";
import express from "express";
import { generateNonce, SiweMessage } from "siwe";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/nonce", function (_, res) {
  res.setHeader("Content-Type", "text/plain");
  res.send(generateNonce());
});
const PORT = process.env.PORT || 3001;
app.post("/verify", async function (req, res) {
  const { message, signature } = req.body;
  const siweMessage = new SiweMessage(message);
  try {
    await siweMessage.verify({ signature });
    res.send(true);
  } catch {
    res.send(false);
  }
});
app.use("*", (req, res) => res.send("Hello World"));

app.listen(PORT, () => {
  console.log("connect");
});
