const config = require('../../config/index.js');
const db = require('../../db/mongo.js');
const neo = require('../../db/neo.js');

const graph = {
  player: (data) => {
    db.index.get(config.index.player.id).then(index => {
      console.log(data);
    })
  },

  organization: (data) => {
    db.index.get(config.index.organization.id).then(index => {
      data.data._id = index.index;
      data = clenseOrganization(data);
      data = data.data;
      neo.query({ query: `MERGE (a:Organization { 
        _id: $_id, 
        archetype: $archetype, 
        banner: $banner, 
        commitment: $commitment, 
        focus_primary: $focus_primary,
        focus_secondary: $focus_secondary,
        href: $href,
        language: $language,
        logo: $logo,
        name: $name,
        pages: $pages,
        recruiting: $recruiting,
        roleplay: $roleplay,
        sid: $sid
      }) RETURN a`, data });
    })
  }
}

function clenseData(data){
  delete data.status;
  delete data.message;
  return data;
}

function clensePlayer(data){
  data = clenseData(data);
  return data;
}

function clenseOrganization(data){
  data = clenseData(data);
  delete data.data.headline;
  data.data.focus_primary = data.data.focus.primary.name;
  data.data.focus_secondary = data.data.focus.secondary.name;
  delete data.data.focus;
  return data;
}

module.exports = graph;