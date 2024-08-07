const express = require("express");
const cors = require("cors");
const {
  getTopics,
  getDescriptionOfEndpoints,
  getArticleById,
  getArticles,
  getCommentsByarticleId,
  postComment,
  patchArticleVotes,
  deleteCommentById,
  getUsers,
  getUserByUsername,
  patchCommentVotes,
  postArticle,
} = require("./controllers/controller");
const app = express();

app.use(cors());

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getDescriptionOfEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByarticleId);

app.get("/api/users", getUsers);

app.get("/api/users/:username", getUserByUsername);

app.post("/api/articles/:article_id/comments", postComment);

app.post("/api/articles", postArticle);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.patch("/api/comments/:comment_id", patchCommentVotes);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("*", (request, response, next) => {
  response.status(404).send({ message: "Not found" });
});

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ message: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "23503" && err.constraint === "comments_author_fkey") {
    response
      .status(404)
      .send({ message: "Not found: username does not exist" });
  } else if (
    err.code === "23503" &&
    err.constraint === "comments_article_id_fkey"
  ) {
    response
      .status(404)
      .send({ message: "Not found: article_id does not exist" });
  } else if (err.code === "23503") {
    response.status(404).send({ message: "Not found: topic does not exist" });
  }
  next(err);
});

app.use((err, resquest, response, next) => {
  if (err.status && err.message) {
    response.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  response.status(500).send({ message: "Internal Server Error" });
});

module.exports = app;
