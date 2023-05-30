import { config } from "dotenv";
config();
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
function validateDomain(domain) {
  const domainPattern = /^https?:\/\/[\w.-]+\.[a-zA-Z]{2,}$/;
  return domainPattern.test(domain);
}

app.post("/nonce", (req, res) => {
  try {
    const { walletAddress, statement, domain } = req.body;
    if (domain === undefined || !walletAddress) {
      return res.status(400).json({
        status: false,
        data: null,
        error: "Invalid domain",
      });
    }
    req.session.nonce = generateNonce();

    if (!req.session.nonce && req.session.nonce !== undefined) {
      throw new Error("Error in generating nonce");
    }

    const message = new SiweMessage({
      domain: domain,
      address: walletAddress,
      statement: statement,
      uri: domain,
      version: "1",
      chainId: 10,
      nonce: req.session.nonce,
    });

    if (!message) {
      throw new Error("Error in generating message");
    }

    res.status(200).json({
      status: true,
      data: message.prepareMessage(),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      data: null,
      error: error,
    });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { message, signature } = req.body;

    // Check if both message and signature are provided
    if (!message || !signature) {
      return res.status(422).json({
        error: "Invalid request. Missing message or signature.",
        data: null,
        status: false,
      });
    }
    let siweMessage;
    if (typeof message === "string") {
      siweMessage = SiweMessage.fromString(message);
    } else {
      siweMessage = new SiweMessage(message);
    }
    if (!siweMessage) {
      return res.status(400).json({
        error: "Invalid message",
        data: null,
        status: false,
      });
    }
    // Verify the signature
    if (await siweMessage.verify({ signature })) {
      return res.status(200).json({
        status: true,
        data: siweMessage,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        error: "Invalid signature",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error, data: null });
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
