const db = require("../db/mongo.js");

test('Insert to the DB', async () => {
  await db.insert({ cid: "0001", handle: "JamesDusky" }, "Test").then(data => {
    expect(data).toBe(true);
  })
})

test('Query the DB', async () => {
  await db.query({ cid: "0001" }, "Test").then(data => {
    expect(data[0]).toHaveProperty("cid");
  })
})

test('Delete from the DB', async () => {
  await db.delete({ cid: "0001" }, "Test").then(data => {
    expect(data).toBe(true);
  })
})

test("Drop Collection from the DB", async () => {
  await db.collections.drop("Test").then(data => {
    expect(data).toBe(true);
  })
})