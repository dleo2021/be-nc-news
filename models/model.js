const db = require("../db/connection");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
  checkArticleExists,
  checkTopicExists,
} = require("../db/seeds/utils");

const fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

const fetchArticleById = (articleId) => {
  return db
    .query(`
      SELECT 
        articles.*, COUNT (comments.comment_id) AS comment_count
      FROM 
        articles
      LEFT JOIN 
        comments 
      ON 
        articles.article_id = comments.article_id
      WHERE 
        articles.article_id = $1
      GROUP BY 
        articles.article_id;
    `, [articleId])

    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return rows[0];
    });
};

const fetchArticles = (sortBy = "created_at", order = "desc", topic) => {
  const validSortByColumns = [
    "author",
    "title",
    "article_id",
    "created_at",
  ];
  const validOrders = ["asc", "desc"];

  if (!validSortByColumns.includes(sortBy)) {
    return Promise.reject({
      status: 400,
      message: "Bad request: Invalid sort_by column",
    });
  }
  if (!validOrders.includes(order)) {
    return Promise.reject({
      status: 400,
      message: "Bad request: Invalid order",
    });
  }

  let queryString = `
  SELECT 
    articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
  COUNT
    (comments.comment_id) AS comment_count 
  FROM 
    articles 
  LEFT JOIN 
    comments 
  ON 
    articles.article_id = comments.article_id 
  `;

  const queryValues = [];

  if (topic) {
    queryString += `WHERE articles.topic = $1 `;
    queryValues.push(topic);
  }

  queryString += `GROUP BY articles.article_id ORDER BY articles.${sortBy} ${order};`;

  const promiseArray = [];
  promiseArray.push(db.query(queryString, queryValues));

  if (topic) {
    promiseArray.push(checkTopicExists(topic));
  }

  return Promise.all(promiseArray).then(([queryResults, topicResult]) => {
    if (queryResults.rows.length === 0 && topicResult === false) {
      return Promise.reject({ status: 404, message: "Topic not found" });
    }
    return queryResults.rows;
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

const fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};

const fetchUserByUsername = (username) => {

  return db.query(`
    SELECT * FROM users WHERE username = $1;`, [username])
    .then(({rows}) => {
      if(rows.length === 0) {
        return Promise.reject({status: 404, message: "Username not found"})
      }
      return rows[0]
    })
}

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

const updateArticleVotes = (articleId, votes) => {
  if (!votes) {
    return Promise.reject({
      status: 400,
      message: "Bad request: Invalid/missing inc_votes",
    });
  }
  return db
    .query(
      `
    UPDATE 
        articles
    SET
        votes = votes + $1
    WHERE
        article_id = $2
    RETURNING *;`,
      [votes, articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Not found: article_id does not exist",
        });
      }
      return rows[0];
    });
};

const removeCommentById = (commentId) => {
  return db
    .query(
      `
    DELETE FROM
      comments
    WHERE
      comment_id = $1
    RETURNING *;`,
      [commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Not found: comment_id does not exist",
        });
      }
      return rows[0];
    });
};

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleId,
  createComment,
  updateArticleVotes,
  removeCommentById,
  fetchUsers,
  fetchUserByUsername
};
