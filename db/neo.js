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
  
  insert: async (data) => {
    const insertResult = await neo.session.run(
      `CREATE (a:Person { name: $name }) RETURN a`,
      { name: data.handle }
    )

    const singleRecord = insertResult.records[0];
    const node = singleRecord.get(0);

    console.log(node);
  }

  
}

module.exports = neo;