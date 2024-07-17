const app = require("../app");
const db = require("../db/connection");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api/invalid-url", () => {
  it("Should return a status 404 - not found", () => {
    return request(app)
      .get("/api/invalid-url")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found");
      });
  });
});

describe("GET /api", () => {
  it("responds with a json detailing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/topics", () => {
  it("GET 200: Responds with an array of topic objects with slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const topics = body.topics;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("GET 200: responds with an article object with all keys required", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("Error - responds with a status 400 - bad request when passed an invalid article_id format", () => {
    return request(app)
      .get("/api/articles/not-a number")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  it("Error - responds with a status 404 - not found when passed a valid but non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
});

describe("GET /api/articles", () => {
  it("GET 200: responds with an array of article objects with the correct property keys", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("comment_count");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("author");
        });
      });
  });
  it("Provides the correct comment count for an article", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        const firstArticle = articles.find(
          (article) => article.article_id === 1
        );
        const fifthArticle = articles.find(
          (article) => article.article_id === 5
        );
        expect(firstArticle.comment_count).toBe("11");
        expect(fifthArticle.comment_count).toBe("2");
      });
  });
  it("Sorts the articles in descending order based on created_at", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
      });
  });
});

describe(" GET /api/articles/:article_id/comments", () => {
  it("Get 200: responds with an array of comments for given article_id with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;
        expect(comments.length).toBe(11);
        comments.forEach((comment) => {
          expect(comment).toEqual({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  it("Responds with a status:200 and an empty array if the article id exists, but has no comments", () => {
    return request(app)
      .get("/api/articles/12/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(0);
        expect(body.comments).toEqual([]);
      });
  });
  it("Error - responds with a status 400 - bad request when passed an invalid article_id format", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  it("Error - responds with a status 404 - not found when passed a valid but non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  it("POST 201: responds with the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a brand new comment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const comment = body.comment;
        console.log(comment);
        expect(comment).toEqual({
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "This is a brand new comment",
          article_id: 2,
        });
      });
  });
  it("Posts a 201 status and responds with the posted comment when body and username are present as well as extra keys on request body (ignores them as long as username and body are present)", () => {
    const newComment = {
      username: "rogersop",
      body: "I like turtles",
      favColour: "red",
      likesCoding: true,
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const comment = body.comment;
        expect(comment).toEqual({
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          author: "rogersop",
          body: "I like turtles",
          article_id: 11,
        });
      });
  });
  it("Responds with an error 404 status when the username input does not exist", () => {
    const newComment = {
      username: "butter",
      body: "hello",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found: username does not exist");
      });
  });
  it("Responds with an error 404 status when the article_id input is valid but does not exist", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Hello everybody",
    };
    return request(app)
      .post("/api/articles/564/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found: article_id does not exist");
      });
  });
  it("Responds with an error 400 status when the article_id input is invalid", () => {
    const newComment = {
      username: "rogersop",
      body: "Another new comment",
    };
    return request(app)
      .post("/api/articles/not-a-valid-id/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  it("Responds with an error 400 status when a required field (body) is missing", () => {
    const newComment = {
      username: "butter",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request: no body provided");
      });
  });
  it("Responds with an error 400 status when a required field (username) is missing", () => {
    const newComment = {
      body: "Potatoes are the best",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request: no username provided");
      });
  });
});
