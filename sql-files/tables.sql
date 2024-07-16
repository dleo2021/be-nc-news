\c nc_news_test

SELECT * FROM topics;


SELECT * FROM users;


SELECT * FROM comments;


SELECT * FROM articles;


SELECT 
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
    articles.created_at DESC;


SELECT 
    articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
FROM 
    articles
JOIN 
    comments 
ON 
    articles.article_id = comments.article_id
GROUP BY articles.article_id;


SELECT 
    articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
FROM 
    articles
RIGHT JOIN 
    comments 
ON 
    articles.article_id = comments.article_id
GROUP BY articles.article_id;


SELECT 
    comments.comment_id, comments.body, comments.author, comments.votes, comments.created_at, articles.article_id
FROM 
    comments
JOIN
    articles
ON 
    comments.article_id = articles.article_id
WHERE 
    articles.article_id = 1
ORDER BY
    comments.created_at DESC;






-- Should:

-- be available on /api/articles/:article_id/comments.
-- get all comments for an article.
-- Responds with:

-- an array of comments for the given article_id of which each comment should have the following properties:
-- comment_id
-- votes
-- created_at
-- author
-- body
-- article_id