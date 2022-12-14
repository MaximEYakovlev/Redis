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
  const albumId = req.query.albumId;
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos?albumId=${albumId}`
  );

  redisClient.setEx(
    `photos?albumId=${albumId}`,
    DEFAULT_EXPIRATION,
    JSON.stringify(data)
  );

  const dataFromRedis = await redisClient.get(
    `photos?albumId=${albumId}`,
    (error, photos) => {
      return photos;
    }
  );

  if (dataFromRedis) {
    res.json(dataFromRedis);
  } else {
    res.json(data);
  }
});

app.get("/photos/:id", async (req, res) => {
  photoId = req.params.id;

  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${photoId}`
  );

  redisClient.setEx(
    `photos/${photoId}`,
    DEFAULT_EXPIRATION,
    JSON.stringify(data)
  );

  const dataFromRedis = await redisClient.get(
    `photos/${photoId}`,
    (error, photos) => {
      return photos;
    }
  );

  if (dataFromRedis) {
    res.json(dataFromRedis);
  } else {
    res.json(data);
  }
});

app.listen(3000);
