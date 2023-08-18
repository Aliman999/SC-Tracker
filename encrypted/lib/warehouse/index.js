const Bottleneck = require("bottleneck");
const config = require('../../config/index.js');
const db = require('../../db/mongo.js');
const queue = require("../queue/index.js");

const warehouse = {
  player: (data) => {
    return new Promise(callback => {
      queue.warehouse.player.pool.schedule(() => {
        db.index.get(config.index.player.id).then(index => {
          data._id = index.index;
          db.insert(clenseData(data), "players").then(data => {
            if(data){
              db.index.increment(config.index.player.id);
              callback();
            }
          })
        })
      })
    })
  },

  organization: (data) => {
    return new Promise(callback => {
      queue.warehouse.organization.pool.schedule(() => {
        db.index.get(config.index.organization.id).then(index => {
          data._id = index.index;
          db.insert(clenseData(data), "organizations").then(data => {
            if(data){
              db.index.increment(config.index.organization.id);
              callback();
            }
          });
        })
      })
    })
  }
}

function clenseData(data){
  delete data.status;
  delete data.message;
  return data;
}

module.exports = warehouse;