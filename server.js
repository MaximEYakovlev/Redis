const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

let redisClient;

(async () => {
  redisClient = Redis.createClient();
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
})();

const DEFAULT_EXPIRATION = 3600;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos"
  );

  redisClient.setEx("photos", DEFAULT_EXPIRATION, JSON.stringify(data));

  const dataFromRedis = await redisClient.get("photos", (error, photos) => {
    return photos;
  });
  res.json(dataFromRedis);
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );
  res.json(data);
});

app.listen(3000);
