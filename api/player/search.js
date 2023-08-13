const api = require("../util/puppeteer.js");

const imgRoot = `https://robertsspaceindustries.com`;
const citizenURL = `https://robertsspaceindustries.com/citizens/`;
const affiliationsURL = `/organizations`;

const player = async (handle) => {
  const user = {
    status: 1,
    message: 'OK',
  };

  //Service passes the users handle and api.run returns a full report of the URL.
  //#TODO
  //Still needs testing for edge cases
  await api.run(citizenURL+handle).then($ => {
    if (!$) {
      user.status = $;
      user.message = "User not found";
      const err = new Error(user.message);
      err.data = user;
      throw err;
    }

    user.profile = {
      cid: $('.value', '.citizen-record').text().replace(/^#/, ''),
      display: $('strong.value', 'p.entry').eq(1).text(),
      handle: $('strong.value', 'p.entry').eq(2).text(),
      badge: { image: imgRoot+$('img', 'span.icon').attr('src'), text:$('span.value', 'p.entry').text() },
      image: imgRoot+$('img', 'div.thumb').attr('src'),
    }

    user.profile.page = {
      title: $('title').text().trim().split('-'),
      url: citizenURL+handle,
    }

    //Clean Title
    user.profile.page.title.pop();
    for(let i = 0; i < user.profile.page.title.length; i++){
      user.profile.page.title[i] = user.profile.page.title[i].trim();
    }
    user.profile.page.title = user.profile.page.title.join(" - ");
    //Clean Title

    //Populates Languages, Location and Enlistment Date
    const elemLabels = $('div.left-col').children('div.inner').children('p.entry').children('span.label');
    const elemValues = $('div.left-col').children('div.inner').children('p.entry').children('strong.value');

    for(let i = 0; i < elemLabels.length; i++){
      if(i != 0){
        user.profile[elemLabels.eq(i).text().toLowerCase()] = elemValues.eq(i).text().replace(/\s{2,}/g,'').trim().split(',');
      }else{
        const d = new Date(parseInt(elemValues.eq(i).text().replace(',', '').split(' ')[2]), getMonthFromString(elemValues.eq(i).text().replace(',', '').split(' ')[0]), parseInt(elemValues.eq(i).text().replace(',', '').split(' ')[1]))
        user.profile[elemLabels.eq(i).text().toLowerCase()] = d;
      }
    }
    //Populates Languages, Location and Enlistment Date

    //Populates Primary Organization Information
    if($('div.restriction').length){
      user.organization = {
        name: 'REDACTED',
      }
    }else if($('div.empty', 'div.inner').length){
      //Do nothing
    }else{
      user.organization = {
        image: imgRoot+$('div.main-org').children('div.inner').children('div.thumb').children('a').children('img').attr('src'),
        name: $('div.main-org').children('div.inner').children('div.info').children('p.entry').children('a').text(),
        sid: $('div.main-org').children('div.inner').children('div.info').children('p.entry').eq(1).children('strong.value').text(),
        rank: $('div.main-org').children('div.inner').children('div.info').children('p.entry').eq(2).children('strong.value').text(),
        starts: $('div.main-org').children('div.inner').children('div.info').children('div.ranking').children('span.active').length,
      }
    }
    //Populates Primary Organization Information
  })

  await api.run(citizenURL+handle+affiliationsURL).then(($) => {
    if (!$) {
      user.status = $;
      user.message = "User not found";
      return;
    }

    const affiliations = [];

    for(let i = 0; i < $('div.affiliation').length; i++){
      const org = $('div.affiliation').eq(i);

      if(org.hasClass('visibility-R')){
        affiliations.push({ name: 'REDACTED' })
      }

      if(org.hasClass('visibility-V')){
        affiliations.push({ 
          image: imgRoot+$('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.thumb').children('a').children('img').attr('src'),
          name: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('p.entry').children('a').text(),
          sid: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('p.entry').eq(1).children('strong.value').text(),
          rank: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('p.entry').eq(2).children('strong.value').text(),
          stars: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('div.ranking').children('span.active').length,
          })
      }
    }

    user.affiliations = affiliations;
  })

  return user;
}

function getMonthFromString(mon){
  var d = Date.parse(mon + "1, 2012");
  if(!isNaN(d)){
    return new Date(d).getMonth();
  }
  return -1;
}

module.exports = player;