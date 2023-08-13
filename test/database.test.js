const db = require("../db/mongo.js");

test('Connect to the DB', async () => {
  await db.start().then(data => {
    expect(data).toBe(true);
  })
})

test('Insert to the DB', async () => {
  await db.insert({ cid: "0001", handle: "JamesDusky" }).then(data => {
    expect(data).toBe(true);
  })
})
/*
test('Query the DB', async () => {
  await db.query({ cid: "0001" }).then(data => {
    expect(data).toBe(true);
  })
})
*/

test('Delete from the DB', async () => {
  await db.delete({ cid: "0001" }).then(data => {
    expect(data).toBe(true);
  })
})

/*
test("Drop Collection from the DB", async () => {
  await db.dropCollection().then(data => {
    expect(data).toBe(true);
  })
})
*/