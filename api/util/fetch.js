const axios = require('axios');
const cheerio = require("cheerio");

const api = {
  run: async (url, payload) => {
    return new Promise(callback => {
      axios((url), {
        method: 'post',
        headers: { 
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5', 
          'User-Agent': "Mozilla/5.0",
          'Cache-Control': 'no-cache',
          'Cookie': "Rsi-Token="
        },
        data: payload,
      }).then((result) => {
        try{
          const $ = cheerio.load(result.data.data.html);
          callback($);
        }catch(e){
          console.log("Fetch Error: ");
          console.log(result.data);
          api.run(url, payload);
        }
      })
    })
  }
}

module.exports = api