const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId, createComment } = require("../models/model")
const endpoints = require("../endpoints.json")
const fs = require("fs/promises")
const { removeBodyFromArticles } = require("../db/seeds/utils")

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

const getArticleById = (request, response, next) => {
    const {article_id} = request.params
    fetchArticleById(article_id).then((article) => {
        response.status(200).send({article})
    })
    .catch((err) => {
        next(err)
    })
}

const getArticles = (request, response, next) => {
    fetchArticles().then((articles) => {
        response.status(200).send({articles})
    }).catch((err) => {
        next(err)
    })
}

const getCommentsByarticleId = (request, response, next) => {
    const {article_id} = request.params
    fetchCommentsByArticleId(article_id)
    .then((comments) => {
        response.status(200).send({comments})
    }).catch((err) => {
        next(err)
    })
}

const postComment = (request, response, next) => {
    const {article_id} = request.params
    const {username, body} = request.body

    createComment(article_id, {username, body})
    .then((comment) => {
        response.status(201).send({comment})
    })
    .catch((err) => {
        next(err)
    })
}

module.exports = {getTopics, getDescriptionOfEndpoints, getArticleById, getArticles, getCommentsByarticleId, postComment}