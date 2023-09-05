const api = require("../util/axios.js");

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
      user.message = `User: ${handle} not found`;
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
      location: ['REDACTED'],
    }
    user.affiliations = [],

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
      if(elemLabels.eq(i).text().toLowerCase() == "location"){
        user.profile[elemLabels.eq(i).text().toLowerCase()] = elemValues.eq(i).text().replace(/\s{2,}/g, '').trim().split(', ');
      }else if(elemLabels.eq(i).text().toLowerCase() == "fluency"){
        user.profile[elemLabels.eq(i).text().toLowerCase()] = elemValues.eq(i).text().replace(/\s{2,}/g, '').trim().split(',');
        user.profile[elemLabels.eq(i).text().toLowerCase()].forEach((e, j) => {
          user.profile[elemLabels.eq(i).text().toLowerCase()][j] = e.trim();
        })
      }else{
        const d = new Date(parseInt(elemValues.eq(i).text().replace(',', '').split(' ')[2]), getMonthFromString(elemValues.eq(i).text().replace(',', '').split(' ')[0]), parseInt(elemValues.eq(i).text().replace(',', '').split(' ')[1]))
        user.profile[elemLabels.eq(i).text().toLowerCase()] = d;
      }
    }
    //Populates Languages, Location and Enlistment Date

    //Populates Primary Organization Information
    if($('div.restriction-r')){
      user.organization = {
        sid: 'REDACTED',
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

    for(let i = 0; i < $('div.affiliation').length; i++){
      const org = $('div.affiliation').eq(i);

      if(org.hasClass('visibility-R')){
        user.affiliations.push({ sid: 'REDACTED' })
      }

      if(org.hasClass('visibility-V')){
        user.affiliations.push({ 
          image: imgRoot+$('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.thumb').children('a').children('img').attr('src'),
          name: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('p.entry').children('a').text(),
          sid: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('p.entry').eq(1).children('strong.value').text(),
          rank: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('p.entry').eq(2).children('strong.value').text(),
          stars: $('div.affiliation').eq(i).children('div.inner-bg').children('div.left-col').children('div.inner').children('div.info').children('div.ranking').children('span.active').length,
          })
      }
    }
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