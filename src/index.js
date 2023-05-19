import cors from "cors";
import express from "express";
import { generateNonce, SiweMessage } from "siwe";
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/nonce", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const nonce = await generateNonce();

    res.status(200).json({
      status: true,
      data: nonce,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error,
    });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { message, signature } = req.body;
    const siweMessage = new SiweMessage(message);
    const data = await siweMessage.verify({ signature });

    res.setHeader("Content-Type", "application/json");

    res.status(200).json({
      status: true,
      data: "something",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error,
    });
  }
});

app.use("*", (req, res) => {
  res.status(202).json({
    message: "Welcome to Replicare",
  });
});

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting Down Server due to Uncaught Exception");
  process.exit(1);
});

app.listen(PORT, () => {
  console.log("connected to http://localhost:3001");
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting Down Server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
