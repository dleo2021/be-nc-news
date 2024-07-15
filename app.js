const express = require("express");
const { getTopics, getDescriptionOfEndpoints } = require("./controllers/controller");
const app = express();

app.get("/api/topics", getTopics)

app.get("/api", getDescriptionOfEndpoints)

app.all("*", (request, response, next) => {
    response.status(404).send({message: "Not found"})
})
app.use((err, request, response, next) => {
    response.status(500).send({message: "Internal Server Error"})
})

module.exports = app