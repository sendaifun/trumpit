import express from "express";
import getStream from "./llm/getStream";

const app = express();

app.get("/", async (req, res) => {
  const response = await getStream(req.query.prompt as string);
  res.send({ response });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
