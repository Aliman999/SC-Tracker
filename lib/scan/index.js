const api = require("../../api/index.js");
const config = require("../../config/index.js");
const db = require("../../db/mongo.js");
const warehouse = require("../warehouse/index.js");

const scanner = {
  players: (callback) => {
    db.index.get(config.index.player.crawler).then(index => {
      db.query({ _id: index.index }, "players").then(data => {
        if(data.length){
          //This means we have not reached the end of our list
          let count = 0;
          let organizations = [];
          organizations.push(data[0].organization);

          data[0].affiliations.forEach(org => {
            organizations.push(org);
          })
          
          organizations.forEach(org => {
            db.query({ "data.sid": org.sid }, "organizations").then(data => {
              api.organization.members.all(org.sid).then(org => {
                count++;
                if(data.length){
                  //If the organization exists in our database we will check historical data
                }else{
                  //We did not find the organization in the database
                  warehouse.organization(org);
                }
              })
            })
          })

          let done = setInterval(() => {
            if(count == organizations.length){
              db.index.increment(config.index.player.crawler);
              clearInterval(done);
              callback();
            }
          }, 1000);
        }else{
          db.index.reset(config.index.organization.crawler);
          callback();
        }
      })
    })
  },

  organizations: (callback) => {
    db.index.get(config.index.organization.crawler).then(index => {
      db.query({ _id: index.index }, "organizations").then(data => {
        if(data.length){
          //This means we have not reached the end of our list
          let members = data[0].members.visible;
          let count = 0;

          data[0].members.data.visible.forEach(member => {
            db.query({ "profile.handle": member.handle }, "players").then(data => {
              api.player(member.handle).then(player => {
                count++;
                if(data.length){
                  //If the player exists in our database we will check historical data
                }else{
                  //We did not find the player in the database
                  warehouse.player(player);
                }
              })
            })
          })
          
          let done = setInterval(() => {
            if(count == members){
              db.index.increment(config.index.organization.crawler);
              clearInterval(done)
              callback();
            }
          }, 1000);
        }else{
          db.index.reset(config.index.organization.crawler);
          callback();
        }
      })
    })
  }
}

module.exports = scanner;