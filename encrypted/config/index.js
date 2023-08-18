require('dotenv').config({path: __dirname+'/.env'})

const config = {
  dev: process.env.ENV == "DEV" ? true : false,
  mongodb: {
    host: process.env.MONGODB_HOST,
    database: process.env.MONGODB_NAME,
    playerCollection: process.env.MONGODB_PLAYER_COLLECTION,
    orgCollection: process.env.MONGODB_ORG_COLLECTION,
    indexCollection: process.env.MONGODB_INDEX_COLLECTION,
  },
  index: {
    player: {
      id: { name: "player id" },
      crawler: { name: "player crawler" },
    },
    organization: {
      id: { name: "organization id" },
      crawler: { name: "organization crawler" },
    }
  },
  neo: {
    host: process.env.NEO4J_HOST,
    database: process.env.NEO4J_DB,
    username: process.env.NEO4J_USER,
    password: process.env.NEO4J_PASS,
  }
};

module.exports = config;