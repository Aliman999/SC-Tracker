const config = require("../config/index.js");
const neo4j = require('neo4j-driver');

const neo = {
  session: neo4j.driver( 
    config.neo.host , 
    neo4j.auth.basic(config.neo.username, config.neo.password) 
    )
    .session({ 
      database: config.neo.database, 
      defaultAccessMode: neo4j.session.WRITE 
    } ),

  query: (data) => {
    return new Promise(async callback => {
      const queryResult = await neo.session.run(data.query, data.data).catch(e => {
        console.log(`[NEO ERROR]: `, e);
        callback();
      })

      const singelRecord = queryResult.records[0];
      const node = singelRecord.get(0);

      callback(node);
    })
  },

  clean: async () => {
    const query = `MATCH (n) DETACH DELETE n`;
    const deleteResult = await neo.session.run(query).catch(e => {
      console.log(e);
    })

    return deleteResult;
  }
}

module.exports = neo;