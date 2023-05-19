import cors from "cors";
import express from "express";
import Session from "express-session";

import { generateNonce, SiweMessage } from "siwe";
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  Session({
    name: "Replicare",
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
  })
);

app.post("/nonce", async (req, res) => {
  try {
    const { walletAddress, statement, domain } = req.body;

    req.session.nonce = generateNonce();

    if (req.session.nonce !== undefined && req.session.nonce) {
      const message = new SiweMessage({
        domain: domain,
        address: walletAddress,
        statement: statement,
        uri: domain,
        version: "1",
        chainId: 10,
        nonce: req.session.nonce,
      });

      if (message !== undefined) {
        res.status(200).json({
          status: true,
          data: message.prepareMessage(),
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message,
    });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { message, signature } = req.body;
    if (!message) {
      res
        .status(422)
        .json({ message: "Expected prepareMessage object as body." });
      return;
    }
    const siweMessage = new SiweMessage(message);

    const dataVar = await siweMessage.verify({ signature });
    console.log(dataVar);

    if (dataVar) {
      res.status(200).json({
        status: true,
        data: dataVar,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message,
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
