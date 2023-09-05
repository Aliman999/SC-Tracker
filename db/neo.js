const config = require("../config/index.js");
const neo4j = require('neo4j-driver');

const Bottleneck = require("bottleneck");

const options = {  
  maxConcurrent: 1,
  minTime: 500
}

const queue = {
  pool: new Bottleneck(options),
}

const neo = {
  session: neo4j.driver( 
    config.neo.host , 
    neo4j.auth.basic(config.neo.username, config.neo.password) 
    )
    .session({ 
      database: config.neo.database, 
      defaultAccessMode: neo4j.session.WRITE 
    } ),

  query: (query, fields = {}) => {
    return new Promise(async callback => {
      queue.pool.schedule(neo.run, query, fields).then(data => {
        callback(data);
      })
    })
  },

  merge: (query, fields = {}) => {
    return new Promise(async callback => {
      queue.pool.schedule(neo.run, query, fields).then(data => {
        callback(data);
      })
    })
  },

  run: (query, fields) => {
    return new Promise(async (callback, reject) => {
      await neo.session.run(query, fields)
      .then((queryResult) => {
        const records = queryResult.records;
        callback(records);
      })
      .catch(e => {
        console.log(`[NEO ERROR]: `, e);
        reject();
      })
    })
  },

  clean: async () => {
    let query = `MATCH (p) DETACH DELETE p;`;
    await neo.query(query);
  }
}

module.exports = neo;