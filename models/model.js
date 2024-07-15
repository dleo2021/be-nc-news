const db = require("../db/connection")

const fetchTopics = () => {
    return db.query("SELECT * FROM topics;").then(({rows}) => {
        return rows
    })
}

const fetchArticleById = (articleId) => {
    return db.query("SELECT * FROM articles WHERE article_id = $1;", [articleId])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, message: "Article not found"})
        }
        return rows[0]
    })
}

module.exports = {fetchTopics, fetchArticleById}

