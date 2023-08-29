const axios = require('axios');
const cheerio = require("cheerio");

const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const fs = require('fs');

const i = 0;

const api = {
  run: async (url, payload = null) => {
    return new Promise(callback => {
      var options = {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5', 
          'User-Agent': "Mozilla/5.0",
          'Cache-Control': 'no-cache',
          'Cookie': "Rsi-Token="
        }
      }
      
      if(payload){
        options.data = payload;
      }

      axios((url), options).then((result) => {
        const $ = cheerio.load(payload ? result.data.data.html : result.data);
        
        console.timeEnd("rateLimit");
        
        i++;
        callback($);
      }).catch((e) => {
        //console.log(e.response.data);
        
        console.time("rateLimit");

        console.log(i);

        if(e.response.status != 404){
          const directory = `${appDir}/logs/${Date.now()}-Error.txt`
          fs.writeFile(directory, e.response.data, { flag: 'wx' }, function (err) {
            if (err) throw err;
            console.log(`Error Logged in ${directory}`);
          });
        }
        callback(null);
      })
    })
  }
}

module.exports = api