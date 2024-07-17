const db = require("../db/connection");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
  checkArticleExists,
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
      return rows;
    });
};

const fetchCommentsByArticleId = (articleId) => {
  const queryValues = [];

  let sqlString = `
    SELECT 
      comments.comment_id, comments.body, comments.author, comments.votes, comments.created_at, articles.article_id
    FROM 
      comments
    JOIN
      articles
    ON 
      comments.article_id = articles.article_id
  `;

  if (articleId) {
    sqlString += `WHERE articles.article_id = $1 `;
    queryValues.push(articleId);
  }

  sqlString += `ORDER BY created_at DESC;`;

  const promiseArray = [];
  promiseArray.push(db.query(sqlString, queryValues));

  if (articleId) {
    promiseArray.push(checkArticleExists(articleId));
  }

  return Promise.all(promiseArray).then(([queryResults, articleResults]) => {
    if (queryResults.rows.length === 0 && articleResults === false) {
      return Promise.reject({ status: 404, message: "Article not found" });
    }
    return queryResults.rows;
  });
};

const createComment = (articleId, { username, body }) => {
  const createdAt = new Date();

  if (!username) {
    return Promise.reject({
      status: 400,
      message: "Bad request: no username provided",
    });
  }
  if (!body) {
    return Promise.reject({
      status: 400,
      message: "Bad request: no body provided",
    });
  }

  return db
    .query(
      `
    INSERT INTO 
      comments (body, author, article_id, created_at, votes)
    VALUES 
      ($1, $2, $3, $4, 0) 
    RETURNING *;`,
      [body, username, articleId, createdAt]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleId,
  createComment,
};
