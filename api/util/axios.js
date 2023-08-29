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
  run: async (url, payload = null) => {
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
          data: payload ? payload : "",
        }).then((result) => {
          if(result.status != 200){
            console.log(result);
            process.exit(0);
          }
          try{
            const $ = cheerio.load(payload ? result.data.data.html : result.data);
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