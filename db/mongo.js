const config = require('../config/index.js');

const { MongoClient } = require('mongodb');

const options = config.mongodb;

//
//  Collections:
//  players
//  organizations
//  index
//

const database = {
  client: new MongoClient(options.host),
  collection: options.playerCollection,

  insert: (data, collection = null) => {
    return new Promise(async callback => {
      if(!Array.isArray(data)){
        data = [ data ];
      }

      if(collection){
        database.collection = await database.client.collection(collection);
      }

      try{
        const insertResult = await database.collection.insertMany(data);
        console.log(`[DB] INSERT [${data.length}] => `, insertResult);
        callback(true);
      }catch(e){
        console.log(`[DB] INSERT ERROR: ${e}`);
        callback(false);
      }
    });
  },

  update: (query, newData, collection = null) => {
    return new Promise(async callback => {
      if(collection){
        database.collection = await database.client.collection(collection);
      }

      try{
        const updateResult = await database.collection.updateOne(query, newData);
        console.log(`[DB] UPDATE => `, updateResult);
        callback(true);
      }catch(e){
        console.log(`[DB] UPDATE ERROR: ${e}`);
        callback(false);
      }
    });
  },

  query: (fields, collection = null) => {
    return new Promise(async callback => {
      if(collection){
        database.collection = await database.client.collection(collection);
      }

      try{
        const queryResult = await database.collection.find(fields).toArray();
        console.log(`[DB] QUERY: `, queryResult);
        callback(queryResult);
      }catch(e){
        console.log(`[DB] QUERY ERROR: ${e}`);
        callback(false);
      }
    });
  },

  delete: (fields, collection = null) => {
    return new Promise(async callback => {
      if(collection){
        database.collection = await database.client.collection(collection);
      }

      try{
        const deleteResult = await database.collection.deleteOne(fields);
        console.log(`[DB] DELETE: `, deleteResult);
        callback(true);
      }catch(e){
        console.log(`[DB] DELETE ERROR: ${e}`);
        callback(false);
      }
    });
  },

  last: () => {
    return new Promise(async callback => {
      if(collection){
        database.collection = await database.client.collection(collection);
      }

      try{
        const lastResult = await database.collection.find().sort( [['_id', -1]]).limit(1);
        console.log(`[DB] LAST: `, lastResult);
        callback(lastResult);
      }catch(e){
        console.log(`[DB] LAST ERROR: ${e}`);
        callback(false);
      }
    })
  },

  collections: {
    drop: async (collection = null) => {
      return new Promise(async callback => {
        if(collection){
          database.collection = await database.client.collection(collection);
        }else{
          callback(false);
        }

        try{
          const dropResult = await database.collection.clean();
          console.log(`[DB] DROP: `, dropResult);
          callback(true);
        }catch(e){
          console.log(`[DB] DROP ERROR: ${e}`);
          callback(false);
        }
      })
    },
    clean: async(collection = null) => {
      return new Promise(async callback => {
        if(collection){
          database.collection = await database.client.collection(collection);
        }else{
          callback(false);
        }

        try{
          const cleanResult = await database.collection.deleteMany({});
          console.log(`[DB] CLEAN: `, cleanResult);
          callback(true);
        }catch(e){
          console.log(`[DB] CLEAN ERROR: ${e}`);
          callback(false);
        }
      })
    }
  },

  index: {
    get: async (fields) => {
      return new Promise(async callback => {
        database.collection = await database.client.collection(options.indexCollection);

        try{
          database.query(fields).then(data => {
            callback(data[0]);
          })
        }catch(e){
          console.log(`[DB] INDEX GET ERROR: ${e}`);
          callback(false);
        }
      })
    },

    set: async (fields) => {
      return new Promise(async callback => {
        database.collection = await database.client.collection(options.indexCollection);

        try{
          database.insert(fields).then(data => {
            callback(data);
          });
        }catch(e){
          console.log(`[DB] INDEX SET ERROR: ${e}`);
          callback(false);
        }
      })
    },

    increment: async (fields) => {
      return new Promise(async callback => {
        database.collection = await database.client.collection(options.indexCollection);

        try{
          database.update(fields, { $inc: { index: 1 } }).then(data => {
            callback(data);
          })
        }catch(e){
          console.log(`[DB] INDEX INCREMENT ERROR: ${e}`);
          callback(false);
        }
      })
    },

    reset: async (fields) => {
      return new Promise(async callback => {
        database.collection = await database.client.collection(options.indexCollection);

        
        try{
          database.update(fields, { $set: { index: 0 } }).then(data => {
            callback(data);
          })
        }catch(e){
          console.log(`[DB] INDEX RESET ERROR: ${e}`);
          callback(false);
        }
      })
    }
  },

};

database.client.connect()
database.client = database.client.db(options.database);
database.collection = database.client.collection(options.playerCollection);

module.exports = database;