const cheerio = require("cheerio");
const config = require("../../config/index.js");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const retry = require('retry');

puppeteer.use(StealthPlugin());

const options = {
  headless: "new",
  executablePath: config.dev ? "" : '/usr/bin/chromium-browser',
  devtools:false,
  args: [
    '--disable-dev-shm-usage',
    //'--disable-accelerated-2d-canvas',
    //'--no-first-run',
    //'--single-process',
    //'--aggressive-cache-discard',
    //'--disable-cache',
    //'--disable-application-cache',
    //'--disable-offline-load-stale-cache',
    //'--devtools-flags=disable',
    //'--disable-gpu',
    '--disable-setuid-sandbox',
    '--no-sandbox',
    '--no-zygote'
  ],
}

const operation = retry.operation({
  retries: 5,
  factor: 3,
  minTimeout: 1 * 1000,
  maxTimeout: 60 * 1000,
  randomize: true,
});

const api = {
  run: (url) => {
    return new Promise(async callback => {
      let selector;
      if(url.includes("organizations")){
        selector = "div.profile-content";
      }else if(url.includes("citizens")){
        selector = "div.profile-content";
      }else if(url.includes("orgs")){
        selector = "div.content-wrapper"
      }else{
        callback("Invalid URL");
      }
      operation.attempt(() => {
        puppeteer.launch(options).then(async (browser) => {
          const page = await browser.newPage();
          await page.setDefaultNavigationTimeout(0);

          try{
            await page.goto(url, { timeout: 0, waitUntil: "load", });
            await page.waitForSelector(selector)
            
            const dom = await page.$eval('*', (el) => el.innerHTML);

            const $ = await cheerio.load(dom);
            callback($);
          }catch(e){
            console.log("Puppeteer error");
            console.log(e);
            operation.retry(e);
          }finally{
            await browser.close();
          }
        });
      })
    })
  }
}


module.exports = api;