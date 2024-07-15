const { fetchTopics } = require("../models/model")
const endpoints = require("../endpoints.json")
const fs = require("fs/promises")

const getTopics = (request, response, next) => {
    fetchTopics().then((topics) => {
        response.status(200).send({topics})
    }).catch((err) => {
        next(err)
    })
}

const getDescriptionOfEndpoints = (request, response, next) => {
    return fs.readFile("./endpoints.json", "utf-8")
    .then((data) => {
        const endpoints = JSON.parse(data)
        response.status(200).send({endpoints})   
    })
    .then((err) => {
        next(err)
    })
}


module.exports = {getTopics, getDescriptionOfEndpoints}