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
          comment_count: '11'
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
  describe("GET /api/articles - sort_by and order queries", () => {
    it("?sort_by= query. Status 200: responds with articles sorted according to a valid column query (defaults to descending order)", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("title", {
            descending: true,
          });
        });
    });
    it("?sort_by=&order= query. Status 200: responds with articles sorted according to a valid column query in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=desc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("article_id", {
            descending: true,
          });
        });
    });
    it("?sort_by=&order= query. Status 200: responds with articles sorted according to a valid column query in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("author");
        });
    });
    it("Status 200: responds with articles sorted by the default parameters", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", {
            descending: true
          });
        });
    });
    it("?sort_by=&order= query. Status 200: responds with articles sorted by any valid column query and a specified order (asc)", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("title");
        });
    });
    // Errors below
    it("?sort_by= reponds with a status 400: bad request when passed an invalid sort_by query", () => {
      return request(app)
        .get("/api/articles?sort_by=not-a-valid-column")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad request: Invalid sort_by column");
        });
    });
    it("?order= responds with a status 400: bad request when passed an invalid order query", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=hello")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad request: Invalid order");
        });
    });
  });
  describe("GET /api/articles - topic query", () => {
    it("get 200: responsed with filtered articles according to given topic query", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    it("get 200: responds with an empty array when passed a valid topic but no articles are categorised by this topic", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(0);
          expect(articles).toEqual([]);
        });
    });
    it("get 200: responds with a correct array of articles when 3 queries are made to the endpoint", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc&topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          expect(articles).toBeSortedBy("author", { ascending: true });
        });
    });
    it("Responds with a 404 status when a non-existant topic is used", () => {
      return request(app)
        .get("/api/articles?topic=not-a-topic")
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Topic not found");
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

describe("PATCH /api/articles/article_id", () => {
  it("Patch 200: responds with the updated article where the votes count will have been altered correctly", () => {
    const votes = { inc_votes: 13 };
    return request(app)
      .patch("/api/articles/7")
      .send(votes)
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article).toEqual({
          article_id: 7,
          title: "Z",
          topic: "mitch",
          author: "icellusedkars",
          body: "I was hungry.",
          created_at: "2020-01-07T14:08:00.000Z",
          votes: 13,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("responds with a status 200: sends updated article when extra keys are sent on request body (they are ignored as long as inc_votes is present", () => {
    const votes = {
      inc_votes: -20,
      username: "rogersop",
      body: "I'm changing the votes",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 80,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("responds with an error 400 status when inc_votes is undefined (e.g. inc_votez - spelled incorrectly", () => {
    const votes = { inc_votez: 12 };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request: Invalid/missing inc_votes");
      });
  });
  it("Responds with an error 400 status - Bad request when value of inc_votes is a string", () => {
    const votes = { inc_votes: "not-a-number" };
    return request(app)
      .patch("/api/articles/10")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  it("Responds with an error 404 status when passed in an article_id that does not exist", () => {
    const votes = { inc_votes: 14 };
    return request(app)
      .patch("/api/articles/78")
      .send(votes)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found: article_id does not exist");
      });
  });
  it("Responds with an error 400 status when the article_id input is invalid", () => {
    const votes = { inc_votes: 46 };
    return request(app)
      .patch("/api/articles/not-a-valid-id")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  it("Responds with a error 400 status when inc_votes is not present on the request body", () => {
    const votes = {
      username: "rogersop",
      likesCoding: true,
    };
    return request(app)
      .patch("/api/articles/8")
      .send(votes)
      .expect(400)
      .send(({ body }) => {
        expect(body.message).toBe("Bad request: Invalid/missing inc_votes");
      });
  });
});

describe("DELETE /api/comments/comment_id", () => {
  it("Delete 204 - deletes the comment acording to comment_id provided", () => {
    return request(app).delete("/api/comments/10").expect(204);
  });
  it("Responds with an error 400 status when comment_id is invalid", () => {
    return request(app)
      .delete("/api/comments/not-a-valid-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request");
      });
  });
  it("Responds with an error 404 status when passed in an valid but non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/39")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found: comment_id does not exist");
      });
  });
});

describe("GET /api/users", () => {
  it("get 200: responds with an array of objects, each with the correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toEqual({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  it("Get 200: responds with a user object with username, name and avatar_url properties", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({body: {user}}) => {
        expect(user).toMatchObject({
          name: "do_nothing",
          username: "lurker",
          avatar_url: "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png"
        })
      })
  })
  it("Responds with an error 404 status if passed a valid entry but the username does not exist", () => {
    return request(app)
    .get("/api/users/not-a-username")
    .expect(404)
    .then(({body: {message}}) => {
      expect(message).toBe("Username not found")
    })
  })
})

describe("PATCH /api/comments/:comment_id", () => {
  it("Patch 200: responds with the updated comment object with votes incremented according to request body", () => {
    const votes = ({inc_votes: 1})
    return request(app)
    .patch("/api/comments/7")
    .send(votes)
    .expect(200)
    .then(({body: {comment}}) => {
      expect(comment).toMatchObject({
        comment_id: 7,
        body: 'Lobster pot',
        article_id: 1,
        author: 'icellusedkars',
        votes: 1,
        created_at: "2020-05-15T20:19:00.000Z"
      })
    })
  })
  it("responds with a status 200: sends updated comment when extra keys are sent on request body (they are ignored as long as inc_votes is present", () => {
    const votes = {
      inc_votes: 27,
      username: "rogersop",
      body: "I'm changing the votes",
    };
    return request(app)
      .patch("/api/comments/13")
      .send(votes)
      .expect(200)
      .then(({ body: {comment} }) => {
        console.log(comment)
        expect(comment).toEqual({
          comment_id: 13,
          body: 'Fruit pastilles',
          article_id: 1,
          author: 'icellusedkars',
          votes: 27,
          created_at: '2020-06-15T10:25:00.000Z'
        });
      });
  });
  it("responds with an error 400 status when inc_votes is undefined (e.g. inc_votez - spelled incorrectly", () => {
    const votes = { inc_votez: 5 };
    return request(app)
      .patch("/api/comments/2")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request: Invalid request body");
      });
  });
  it("Responds with an error 400 status - Bad request when value of inc_votes is a string", () => {
    const votes = { inc_votes: "not-a-number" };
    return request(app)
      .patch("/api/comments/11")
      .send(votes)
      .expect(400)
      .then(({ body: {message} }) => {
        expect(message).toBe("Bad request");
      });
  });
  it("Responds with an error 404 status when passed in an comment_id that does not exist", () => {
    const votes = { inc_votes: 14 };
    return request(app)
      .patch("/api/comments/782")
      .send(votes)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found: comment does not exist");
      });
  });
  it("Responds with an error 400 status when the comment_id input is invalid", () => {
    const votes = { inc_votes: 46 };
    return request(app)
      .patch("/api/comments/not-a-valid-id")
      .send(votes)
      .expect(400)
      .then(({ body: {message} }) => {
        expect(message).toBe("Bad request");
      });
  });
  it("Responds with a error 400 status when inc_votes is not present on the request body", () => {
    const votes = {};
    return request(app)
      .patch("/api/comments/8")
      .send(votes)
      .expect(400)
      .send(({ body: {message} }) => {
        expect(message).toBe("Bad request: Invalid request body");
      });
  });
})