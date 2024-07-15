const express = require("express");
const { getTopics, getDescriptionOfEndpoints, getArticleById } = require("./controllers/controller");
const app = express();

app.get("/api/topics", getTopics)

app.get("/api", getDescriptionOfEndpoints)

app.get("/api/articles/:article_id", getArticleById)

app.all("*", (request, response, next) => {
    response.status(404).send({message: "Not found"})
})

app.use((err, request, response, next) => {
    if (err.code === "22P02") {
        response.status(400).send({message: "Bad request"})
    } else {
        next(err)
    }
})

app.use((err, resquest, response, next) => {
    if(err.status && err.message) {
        response.status(err.status).send({message: err.message})
    } else {
        next(err)
    }
})

app.use((err, request, response, next) => {
    response.status(500).send({message: "Internal Server Error"})
})

module.exports = app