const axios = require('axios');
const cheerio = require("cheerio");
const retry = require('retry');

const operation = retry.operation({
  retries: 5,
  factor: 3,
  minTimeout: 1 * 1000,
  maxTimeout: 60 * 1000,
  randomize: true,
});

const api = {
  run: async (url, payload) => {
    return new Promise(callback => {

      operation.attempt(() => {
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
            console.log("Fetch Error");
            console.log(e);
            operation.retry(e);
          }
        })
      });
      
    })
  }
}

module.exports = api