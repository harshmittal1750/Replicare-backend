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
  const generateNonceVar = generateNonce();
  if (generateNonceVar !== undefined && generateNonceVar !== "") {
    res.status(200).send(generateNonceVar);
    console.log(generateNonceVar);
  } else {
    res.status(400).send("Error");
  }
  // res.status(200).send(generateNonce());
  // console.log(generateNonce());
});

const PORT = process.env.PORT || 3001;
app.post("/verify", async function (req, res) {
  console.log(
    "req.body.message: " +
      req.body.message +
      " req.body.signature: " +
      req.body.signature
  );
  const { message, signature } = req.body;
  const siweMessage = new SiweMessage(message);

  try {
    if (
      message !== undefined &&
      message !== "" &&
      signature !== undefined &&
      signature !== ""
    ) {
      await siweMessage.verify({ signature });
      res.send(true);
    }
  } catch (err) {
    console.log(err);
    res.send(false);
  }
});
app.use("*", (req, res) => res.send("Hello World"));

app.listen(PORT, () => {
  console.log("connect");
});
