const api = require("./api/index.js");
const database = require("./db/mongo.js");
const neo = require("./db/neo.js")
const scanner = require("./lib/scan/index.js");
const warehouse = require("./lib/warehouse/index.js");
const queue = require("./lib/queue/index.js");
const graph = require("./lib/graph/index.js");

const orgJson = require("./orgs.json");
const playerJson = require("./players.json");


async function reset() {
  database.collections.clean("index");
  database.collections.clean("players");
  database.collections.clean("organizations");

  neo.clean();
  //await populateNeo();
  
  database.index.set({ name: "player id", index: 0 });
  database.index.set({ name: "player crawler", index: 0 });
  database.index.set({ name: "organization id", index: 0 });
  database.index.set({ name: "organization crawler", index: 0 });

  api.organization.members.all("RSPN").then(data => {
    warehouse.organization(data);
  }).catch(e => {
    console.log(e);
  })

  api.organization.members.all("MOBI").then(data => {
    warehouse.organization(data);
  }).catch(e => {
    console.log(e);
  })

  api.player("speedygang8886").then(data => {
    warehouse.player(data);
  }).catch(e => {
    console.log(e);
  })

  api.player("Demonton").then(data => {
    warehouse.player(data);
  }).catch(e => {
    console.log(e);
  })
}

async function populateNeo(){
  await neo.clean();

  let keys = Object.keys(orgJson);
  let values = Object.values(orgJson); 

  keys.forEach((e, i) => {
    values[i].forEach(j => {
      e = e.charAt(0).toUpperCase() + e.slice(1)
      graph.label({ label: e, type: j })
    })
  })

  keys = Object.keys(playerJson);
  values = Object.values(playerJson);

  keys.forEach((e, i) => {
    values[i].forEach(j => {
      e = e.charAt(0).toUpperCase() + e.slice(1)
      graph.label({ label: e, type: j })
    })
  })
}

async function relateNeo(){
  database.query({}).then(result => {
    result.forEach(e => {
      formatPlayer(e);
      graph.player(e);
    });
  });

  database.query({}, "organizations").then(result => {
    result.forEach(e => {
      formatOrg(e);
      graph.organization(e);
    });
  });

  function formatOrg(org){
    org.data.primary = org.data.focus.primary.name;
    org.data.secondary = org.data.focus.secondary.name;
    delete org.data.focus;
  }

  function formatPlayer(player){
    player.profile.badge = player.profile.badge.text;
  }
}

async function players() {
  if(queue.scan.player.status){
    queue.scan.player.pool.schedule(async () => {
      scanner.players(() => {
        queue.scan.player.status = true;
        setTimeout(players, 1000);
      })
    })
  }else{
    setTimeout(players, 1000);
  }
}

async function orgs() {
  if(queue.scan.organization.status){
    queue.scan.organization.pool.schedule(async () => {
      scanner.organizations(() => {
        queue.scan.organization.status = true
        setTimeout(orgs, 1000);
      })
    })
  }else{
    setTimeout(orgs, 1000);
  }
}

async function start() {
  await database.index.get({ name: "organization id" })
  await database.index.get({ name: "player id" })
  players();
  orgs();
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

start();
//populateNeo();
//reset();
//relateNeo();