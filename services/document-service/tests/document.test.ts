import request from "supertest";
import app from "../src/app";
import Document from "../src/models/document.model";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Document Service Tests", () => {
  it("should create a document", async () => {
    const res = await request(app)
      .post("/api/documents")
      .send({
        title: "Test Document",
        description: "Hello Testing!"
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Document");
  });

  it("should list documents for user", async () => {
    await Document.create({
      title: "Doc 1",
      description: "Test",
      ownerId: "test-user-123"
    });

    const res = await request(app).get("/api/documents");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should get a document by id", async () => {
    const doc = await Document.create({
      title: "Get Doc",
      ownerId: "test-user-123"
    });

    const res = await request(app).get(`/api/documents/${doc._id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Get Doc");
  });

  it("should update a document", async () => {
    const doc = await Document.create({
      title: "Old Title",
      ownerId: "test-user-123"
    });

    const res = await request(app)
      .put(`/api/documents/${doc._id}`)
      .send({ title: "New Title" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New Title");
  });

  it("should delete a document", async () => {
    const doc = await Document.create({
      title: "Delete Me",
      ownerId: "test-user-123"
    });

    const res = await request(app).delete(`/api/documents/${doc._id}`);

    expect(res.status).toBe(200);

    const find = await Document.findById(doc._id);
    expect(find).toBeNull();
  });
});
