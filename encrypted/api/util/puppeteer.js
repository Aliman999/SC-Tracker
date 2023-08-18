const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const options = {
  headless: "new",
  executablePath: '/usr/bin/chromium-browser',
  args: [
    //'--disable-dev-shm-usage',
    //'--disable-accelerated-2d-canvas',
    //'--no-first-run',
    //'--single-process',
    //'--aggressive-cache-discard',
    //'--disable-cache',
    //'--disable-application-cache',
    //'--disable-offline-load-stale-cache',
    '--devtools-flags=disable',
    '--disable-gpu',
    '--disable-setuid-sandbox',
    '--no-sandbox',
    '--no-zygote'
  ],
}


const api = {
  run: (url) => {
    return new Promise(async callback => {
      let selector;
      console.log(url);
      if(url.includes("organizations")){
        selector = "div.profile-content";
      }else if(url.includes("citizens")){
        selector = "div.profile-content";
      }else if(url.includes("orgs")){
        selector = "div.content-wrapper"
      }else{
        callback("Invalid URL");
      }
      const browser = await puppeteer.launch(options);
      const page = await browser.newPage();
      await page.goto(url, { timeout: 0 });
      await page.waitForSelector(selector)
        .catch(() => {
          callback(0);
          return;
        });

      const dom = await page.$eval('*', (el) => el.innerHTML);
      const $ = cheerio.load(dom);

      await browser.close();
      callback($);
    })
  }
}


module.exports = api;