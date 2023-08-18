const neo = require('../db/neo.js');
const api = require('../api/index.js');

jest.setTimeout(60000);
jest.useFakeTimers()

test("Insert Player to Neo", () => {
  api.player("JamesDusky").then((data) => {
    const result = neo.query(`CREATE (a:Player $fields) RETURN a`, data)
    //jest.setTimeout(60000);
    expect(result).toBe(true);
  })
})

test("Query player from Neo", () => {
  const result = neo.query(`MATCH (a:Player) WHERE a.handle = $fields RETURN a`,  "JamesDusky").then(() => {
    expect(result).toBe(true);
  })
})

test("Delete player from Neo", () => {
  const result = neo.query(`MATCH (a:Player) WHERE a.handle = $fields DELETE a`, "JamesDusky").then(() => {
    expect(result).toBe(true);
  })
})

/*
test('Query player from RSI', async () => {
  await api.search.player("JamesDusky").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('profile');
  })
})
*/