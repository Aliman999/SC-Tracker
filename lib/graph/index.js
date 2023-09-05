const neo = require('../../db/neo.js');

const graph = {
  player: (data) => {
    return new Promise(callback => {
      data.profile._id = data._id;
      data = clensePlayer(data);
      data.profile.enlisted = JSON.stringify(data.profile.enlisted);
      data.profile.fluency = data.profile.fluency.join(", ");
      data.profile.location = data.profile.location.join(', ');
      data.profile.affiliations = [];

      for(let i = 0; i < data.affiliations.length; i++){
        data.profile.affiliations.push(data.affiliations[i].sid);
      }

      data.profile.affiliations = data.profile.affiliations.join(", ");

      const keys = Object.keys(data.profile);

      let query = `MERGE (a:Player {`;

      for(let i = 0; i < keys.length; i++){
        if(i != keys.length-1){
          query += `${keys[i]}: $${keys[i]}, `;
        }else{
          query += `${keys[i]}: $${keys[i]} `;
        }
      }

      query += `}) RETURN a;`;

      neo.query(query, data.profile).then(() => {
        callback();
      });
      graph.relatePlayer(data);
    })
  },

  organization: (data) => {
    return new Promise(callback => {
      data.data._id = data._id;
      data = clenseOrganization(data);

      const keys = Object.keys(data.data);

      let query = `MERGE (a:Organization { sid: $sid }) RETURN a`;
      neo.query(query, data.data).then((result) => {
        if(result.length == 1){
          query = `MERGE (a:Organization { sid: $sid }) `;
          query += `SET `
          for(let i = 0; i < keys.length; i++){
            if(i != keys.length-1){
              query += `a.${keys[i]} = $${keys[i]}, `;
            }else{
              query += `a.${keys[i]} = $${keys[i]} `;
            }
          }
          neo.query(query, data.data);
        }else{
          query = `MERGE (a:Organization { sid: $sid }) RETURN a`;

          for(let i = 0; i < keys.length; i++){
            if(i != keys.length-1){
              query += `${keys[i]}: $${keys[i]}, `;
            }else{
              query += `${keys[i]}: $${keys[i]} `;
            }
          }

          query += `}) RETURN a;`;

          neo.query(query, data.data).then(() => {
            callback();
          });
        }

        graph.relateOrg(data);
      });
    })
  },

  relateOrg: (data) => {
    const org = {
      primary: 'p',
      secondary: 's',
      archetype: 'a',
      commitment: 'c',
      language: 'l',
      recruiting: 'r',
      roleplay: 't'
    }

    let query = `MATCH (o:Organization { name: $name }) `
    const keys = Object.keys(org);
    const values = Object.values(org);

    let j = 0;
    for(let i = 0; i < keys.length; i++){
      if(data.data[keys[i]] != undefined){
        if(i != keys.length-1){
          query += `MERGE (${values[i]}:${keys[i].charAt(0).toUpperCase() + keys[i].slice(1)} { value: $${keys[i]} }) `;
        }else{
          query += `MERGE (${values[i]}:${keys[i].charAt(0).toUpperCase() + keys[i].slice(1)} { value: $${keys[i]} }) `;
        }
        j++;
      }
    }

    let k = 0;
    for(let i = 0; i < keys.length; i++){
      if(data.data[keys[i]] != undefined){
        switch(i){
          case (0):
            query += `MERGE (o)-[:Focus]->(${values[i]}) `;
            k++;
            break;
          case (1):
            query += `MERGE (o)-[:Focus]->(${values[i]}) `;
            k++;
            break;
          case (2):
            query += `MERGE (o)-[:Archetype]->(${values[i]}) `;
            k++;
            break;
          case (3):
            query += `MERGE (o)-[:Commitment]->(${values[i]}) `;
            k++;
            break;
          case (4):
            query += `MERGE (o)-[:Language]->(${values[i]}) `;
            k++;
            break;
          case (5):
            query += `MERGE (o)-[:Recruiting]->(${values[i]}) `;
            k++;
            break;
          case (6):
            query += `MERGE (o)-[:Roleplay]->(${values[i]}) `;
            k++;
            break;
        }
      }
    }

    if(k != keys.length){
      query = query.split(',').join(", ");
    }

    query += `RETURN o;`

    neo.query(query, data.data);
  },

  relatePlayer: (data) => {
    graph.linkOrgs(data);
    const languages = [ ...new Set(data.profile.fluency.split(", "))];
    const location = data.profile.location.split(", ");


    let query = `MERGE (p:Player { handle: $handle }) `;
    query += `MERGE (b:Badge { value: $badge }) `;

    for(let i = 0; i < languages.length; i++){
      data.profile[languages[i]] = languages[i];
      query += `MERGE (${languages[i]}:Fluency { value: $${languages[i]} }) `;
      query += `MERGE (p)-[:Fluency]-(${languages[i]}) `;
    }

    for(let i = 0; i < location.length; i++){
      const id = makeid(location[i].length)
      data.profile[id] = location[i];
      query += `MERGE (${id}:Location { value: $${id} }) `;
      query += `MERGE (p)-[:Location]-(${id}) `;
    }

    query += `MERGE (p)-[:Badge]->(b) `;
    query += `RETURN p;`


    neo.query(query, data.profile);
  },

  linkOrgs: (data) => {
    let query = `MERGE (p:Player { handle: $handle }) `;

    let fields = data.profile;

    for(let i = 0; i < data.affiliations.length; i++){
      let id = makeid(data.affiliations[i].sid.length);
      fields[id] = data.affiliations[i].sid;
      query += `MERGE (${id}:Organization { sid: $${id} }) `
      query += `MERGE (p)-[:Affiliate]-(${id})`;
    }

    query += `RETURN p;`

    neo.query(query, fields);
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
  if(!data.affiliations) data.affiliations = [];
  data.affiliations.push(data.organization);
  delete data.organization;
  return data;
}

function clenseOrganization(data){
  data = clenseData(data);
  delete data.data.headline;
  delete data.data.focus;
  return data;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

module.exports = graph;