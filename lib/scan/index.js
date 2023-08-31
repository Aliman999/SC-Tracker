const api = require("../../api/index.js");
const config = require("../../config/index.js");
const db = require("../../db/mongo.js");
const graph = require("../graph/index.js");
const warehouse = require("../warehouse/index.js");

var OneDay = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);


const scanner = {
  players: (callback) => {
    db.index.get(config.index.player.crawler).then(index => {
      db.query({ _id: index.index }, "players").then(player => {
        if(player.length && Number.isInteger(player[0]?._id) && player[0]?._id <= db.id["player id"]){
          //This means we have not reached the end of our list
          //console.log(`[SCANNER] Started Player: ${player[0].profile.handle}`);
          let count = 0;
          let organizations = [];
          
          if(player[0].organization?.sid){
            organizations.push(player[0].organization);
          }

          player[0].affiliations.forEach(org => {
            organizations.push(org);
          })
          
          organizations.forEach(org => {
            if(org.name != "REDACTED"){
              db.query({ "data.sid": org.sid }, "organizations").then(data => {
                if(data.length){
                  count++;
                  if (data[0].lastUpdated >= OneDay) {
                    //Update
                    //console.log("Org data stored over one day");
                  }
                }else{
                  api.organization.members.all(org.sid).then(async api_Org => {
                    count++;

                    //We did not find the organization in the database
                    await warehouse.organization(JSON.parse(JSON.stringify(api_Org)));
                    //graph.organization(JSON.parse(JSON.stringify(org)));
                  }).catch(e => {
                    console.log(e.message);
                    callback();
                  })
                }
              })
            }
          })

          let done = setInterval(() => {
            if(count == organizations.length){
              db.index.increment(config.index.player.crawler);
              //console.log(`[SCANNER] Finished Player: ${player[0].profile.handle}`);
              clearInterval(done);
              callback();
            }
          }, 1000);
        }else{
          db.index.reset(config.index.player.crawler);
          callback();
        }
      })
    })
  },

  organizations: (callback) => {
    db.index.get(config.index.organization.crawler).then(index => {
      db.query({ _id: index.index }, "organizations").then(org => {
        if(org.length && Number.isInteger(org[0]?._id) && org[0]?._id <= db.id["organization id"]){//test 2
          //console.log(`[SCANNER] Started Org: ${org[0].data.name}`);
          //This means we have not reached the end of our list
          let members = org[0].members.visible;
          let count = 0;

          org[0].members.data.visible.forEach(member => {
            db.query({ "profile.handle": member.handle }, "players").then(data => {
              if(data.length){
                count++;
                if (data[0].lastUpdated <= OneDay) {
                  //Update
                  //console.log("Player data stored over one day");
                }
              }else{
                api.player(member.handle).then(async player => {
                  count++;

                  //We did not find the player in the database
                  await warehouse.player(JSON.parse(JSON.stringify(player)));
                  //graph.player(JSON.parse(JSON.stringify(player)));
                }).catch(e => {
                  console.log(e.message);
                  callback();
                })
              }
            })
          })
          
          let done = setInterval(async () => {
            if(count == members){
              clearInterval(done);
              await db.index.increment(config.index.organization.crawler);
              //console.log(`[SCANNER] Stored Players of ${org[0].data.name}`);
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