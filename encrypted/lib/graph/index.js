const config = require('../../config/index.js');
const db = require('../../db/mongo.js');
const neo = require('../../db/neo.js');

const graph = {
  player: (data) => {
    db.index.get(config.index.player.id).then(index => {
      data.profile._id = index.index;
      data = clensePlayer(data);
      data.profile.enlisted = JSON.stringify(data.profile.enlisted);
      neo.query(`MERGE (a:Player {
        handle: $handle,
        _id: $_id,
        cid: $cid,
        display: $display,
        fluency: ['${data.profile.fluency.join("', '")}'],
        image: $image,
        location: ['${data.profile.location.join("', '")}'],
        page: $page
      }) RETURN a`, data.profile);
    })
  },

  organization: (data) => {
    db.index.get(config.index.organization.id).then(index => {
      data.data._id = index.index;
      data = clenseOrganization(data);
      neo.query(`MERGE (a:Organization {
        sid: $sid,
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
        recruiting: $recruiting,
        roleplay: $roleplay
      }) RETURN a`, data.data);
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
  data.profile.badge = data.profile.badge.text;
  data.profile.page = data.profile.page.title;
  data.affiliations.push(data.organization);
  delete data.organization;
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