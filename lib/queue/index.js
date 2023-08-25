const Bottleneck = require("bottleneck");

const options = {  
  maxConcurrent: 1,
  minTime: 500
}

const queue = {
  warehouse: {
    player: {
      pool: new Bottleneck(options),
      status: true,
    },
    organization:{
      pool: new Bottleneck(options),
      status: true,
    },
  },
  scan: {
    player:{
      pool: new Bottleneck(options),
      status: true,
    },
    organization:{
      pool: new Bottleneck(options),
      status: true,
    },
  }
}

queue.scan.player.pool.on("received", (error) => {
  queue.scan.player.status = false;
})

queue.scan.organization.pool.on("received", (error) => {
  queue.scan.organization.status = false;
})

module.exports = queue;