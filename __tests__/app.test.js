const app = require("../app");
const db = require("../db/connection");
const request = require("supertest");
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data/index")

beforeEach(() => {
    return seed(data);
  });
  
  afterAll(() => {
    return db.end();
  });

  describe("/api/topics", () => {
    it("GET 200: Responds with an array of topic objects with slug and description properties", () => {
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({body}) => {
            const topics = body.topics
            expect(topics).toHaveLength(3)
            topics.forEach((topic) => {
                expect(topic).toEqual({
                    slug: expect.any(String),
                    description: expect.any(String)
                })
            })
        })
    })
  })