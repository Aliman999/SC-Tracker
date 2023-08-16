const api = require("../api/index.js");

test('Query player from RSI', async () => {
  await api.player("JamesDusky").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('profile');
  })
})

test('Query organization info from RSI', async () => {
  await api.organization.info("PROTECTORA").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('data');
  })
})

test('Query organization members from RSI', async () => {
  await api.organization.members.all("MOBI").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('data');
  })
})