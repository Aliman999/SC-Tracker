const api = require('../util/puppeteer.js');
const fetch = require('../util/fetch.js');

const imgRoot = `https://robertsspaceindustries.com`;
const orgURL = `https://robertsspaceindustries.com/orgs/`;
const orgSearchURL = `https://robertsspaceindustries.com/api/orgs/getOrgs`;


const organization = async (sid) => {
  const page = 1;

  const payload = {
    activity: [],
    commitment: [],
    language: [],
    model: [],
    pagesize: 12,
    recruiting: [],
    roleplay: [],
    search: sid,
    page: page,
    size: [],
    sort: ""
  }

  const organization = {
    status: 1,
    message: 'OK',
  }

  await api.run(orgURL+sid).then($ => {
    if(!$('div.inner').html()){
      organization.status = $;
      organization.message = "Organization not found";
      const err = new Error(organization.message);
      err.data = organization;
      throw err;
    }

    const name = $('div.inner').children("h1").text().split(" / ");

    organization.data = {
      name: name[0],
      sid: name[1],
      banner: imgRoot+$('div.banner').children('img').attr('src'),
      logo: imgRoot+$('div.inner').children('div.logo').children('img').attr('src'),
      archetype: $('div.inner').children('ul.tags').children('li.model').text(),
      commitment: $('div.inner').children('ul.tags').children('li.commitment').text(),
      focus: {
        primary: {
          image: imgRoot+$('div.inner').children('ul.focus').children('li.primary').children('img').attr('src'),
          name: $('div.inner').children('ul.focus').children('li.primary').children('img').attr('alt'),
        },
        secondary: {
          image: imgRoot+$('div.inner').children('ul.focus').children('li.secondary').children('img').attr('src'),
          name: $('div.inner').children('ul.focus').children('li.secondary').children('img').attr('alt'),
        }
      },
      headline: {
        html: $('div.join-us').children('div.body').html(),
        plaintext: $('div.join-us').children('div.body').text()
      },
      href: orgURL+sid,
      pages: Math.ceil(parseInt($('div.inner').children('div.logo').children('span.count').text().split(" ")[0])/32),
    }
  })


  await fetch.run(orgSearchURL, payload).then($ => {
    for(let i = 0; i < $('div.org-cell').length; i++){
      if($('div.org-cell').eq(i).children('a').children('span.left').children('span.identity').children('h3.name').text() == organization.data.name){
        organization.data.language = $('div.org-cell').eq(i).children('a').children('span.right').children('span.infocontainer').eq(0).children('span.infoitem').eq(1).children('span.value').text();
        organization.data.recruiting = $('div.org-cell').eq(i).children('a').children('span.right').children('span.infocontainer').eq(1).children('span.infoitem').eq(0).children('span.value').text() == "Yes" ? true : false;
        organization.data.roleplay = $('div.org-cell').eq(i).children('a').children('span.right').children('span.infocontainer').eq(1).children('span.infoitem').eq(1).children('span.value').text() == "Yes" ? true : false;
        break;
      }
    }
  })
  
  return organization;
}

module.exports = organization;