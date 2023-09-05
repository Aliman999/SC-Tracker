const config = require('../../config/index.js');
const db = require('../../db/mongo.js');
const queue = require("../queue/index.js");
const graph = require("../graph/index.js");

const warehouse = {
  player: (data) => {
    return new Promise(callback => {
      queue.warehouse.player.pool.schedule(() => {
        db.index.get(config.index.player.id).then(index => {
          data._id = index.index;
          data.lastUpdated = Date.now();
          db.insert(clenseData(data), "players").then(insertResult => {
            db.index.increment(config.index.player.id);
            graph.player(JSON.parse(JSON.stringify(data)));
            if(insertResult){
              callback(insertResult);
            }else{
              warehouse.player(data);
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
          data.lastUpdated = Date.now();
          db.insert(clenseData(data), "organizations").then(insertResult => {
            db.index.increment(config.index.organization.id);
            graph.organization(JSON.parse(JSON.stringify(data)));
            if(insertResult){
              callback(insertResult);
            }else{
              warehouse.organization(data);
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