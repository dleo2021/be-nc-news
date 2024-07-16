const db = require("../db/connection");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
  removeBodyFromArticles,
} = require("../db/seeds/utils");

const fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

const fetchArticleById = (articleId) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return rows[0];
    });
};

const fetchArticles = () => {
  return db
    .query(
      `SELECT 
        articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
      FROM 
        articles
      LEFT JOIN 
        comments 
      ON 
        articles.article_id = comments.article_id
      GROUP BY 
        articles.article_id 
      ORDER BY
        articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows
    });
};

module.exports = { fetchTopics, fetchArticleById, fetchArticles };
