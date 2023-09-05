const neo = require("./db/neo.js");
const database = require("./db/mongo.js");
const fs = require("fs");

const player = {
  badge: [],
  fluency: [],
  location: []
}

const org = {
  primary: [],
  secondary: [],
  archetype: [],
  commitment: [],
  language: [],
  recruiting: [],
  roleplay: []
}

database.query({}).then(result => {
  result.forEach(e => {
    formatPlayer(e);
    const keys = Object.keys(e.profile);
    const values = Object.values(e.profile);
    for(let i = 0; i < keys.length; i++){
      if(player[keys[i]]){
        if(keys[i] == 'fluency' && values[i].length >= 1){
          values[i] = values[i][0];
          values[i] = values[i].split(',');
          values[i].forEach(e => {
            player[keys[i]].push(e);
          })
          continue;
        }
        if(keys[i] == 'location'){
          values[i].forEach(e => {
            player[keys[i]].push(e);
          })
          continue;
        }
        player[keys[i]].push(values[i]);
      }
    }
  });
  for (const key in player) {
    if (player.hasOwnProperty(key)) {
      player[key] = [... new Set(player[key])];
    }
  }
  /*
  fs.writeFile("./logs/players.json", JSON.stringify(player), (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("The written has the following contents:");
      console.log(fs.readFileSync("players.json", "utf8"));
    }
  });
  */
});

database.query({}, "organizations").then(result => {
  result.forEach(e => {
    formatOrg(e);
    const keys = Object.keys(e.data);
    const values = Object.values(e.data);
    for(let i = 0; i < keys.length; i++){
      if(org[keys[i]]){
        org[keys[i]].push(values[i]);
      }
    }
  });
  for (const key in org) {
    if (org.hasOwnProperty(key)) {
      org[key] = [... new Set(org[key])];
    }
  }
  /*
  fs.writeFile("./logs/orgs.json", JSON.stringify(org), (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("The written has the following contents:");
      console.log(fs.readFileSync("orgs.json", "utf8"));
    }
  });
  */
});

function formatOrg(org){
  org.data.primary = org.data.focus.primary.name;
  org.data.secondary = org.data.focus.secondary.name;
  delete org.data.focus;
}

function formatPlayer(player){
  player.profile.badge = player.profile.badge.text;
}


/*
Required Player Labels
  Required Labels:
    badge
    fluency
    location

  Required Relationship Labels
    organization rank
    stars

Required Organization Labels
  Required Labels:
    primary
    secondary
    archetype
    commitment
    language
    recruiting
    roleplay

  Required Relationship Labels
    recruiting
    roleplay
*/