const axios = require('axios');
const cheerio = require("cheerio");

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
        callback($);
      }).catch((e) => {
        fs.writeFile("books.txt", data, (err) => {
          if (err)
            console.log(err);
          else {
            console.log("File written successfully\n");
            console.log("The written has the following contents:");
            console.log(fs.readFileSync("books.txt", "utf8"));
          }
        });
        console.log(e);
        callback(null);
      })
    })
  }
}

module.exports = api