const api = require("./api/index.js");
const database = require("./db/mongo.js");
const graph = require("./lib/graph/index.js");
const neo = require("./db/neo.js")
const scanner = require("./lib/scan/index.js");
const warehouse = require("./lib/warehouse/index.js");
const queue = require("./lib/queue/index.js");


function reset() {
  database.collections.clean("index");
  database.collections.clean("players");
  database.collections.clean("organizations");
  neo.clean();
  
  database.index.set({ name: "player id", index: 0 });
  database.index.set({ name: "player crawler", index: 0 });
  database.index.set({ name: "organization id", index: 0 });
  database.index.set({ name: "organization crawler", index: 0 });

  api.organization.members.all("MOBI").then(data => {
    warehouse.organization(JSON.parse(JSON.stringify(data)));
    graph.organization(JSON.parse(JSON.stringify(data)));
  }).catch(e => {
    console.log(e);
  })

  api.player("Grinlike").then(data => {
    warehouse.player(JSON.parse(JSON.stringify(data)));
    graph.player(JSON.parse(JSON.stringify(data)));
  }).catch(e => {
    console.log(e);
  })
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
  //players();
  orgs();
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

//start();
reset();