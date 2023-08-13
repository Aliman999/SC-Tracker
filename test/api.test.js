const player = require('../api/player/search.js');
const info = require('../api/organization/search.js');
const members = require('../api/organization/members.js');

const api = {
  search: {
    player,
    organization: {
      info,
      members
    }
  }
}

test('Query player from RSI', async () => {
  await api.search.player("JamesDusky").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('profile');
  })
})

test('Query organization info from RSI', async () => {
  await api.search.organization.info("PROTECTORA").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('data');
  })
})

test('Query organization members from RSI', async () => {
  await api.search.organization.members("PROTECTORA").then(data => {
    expect(data).toMatchObject({ status: 1 });
    expect(data).toHaveProperty('data');
  })
})