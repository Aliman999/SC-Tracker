const fetch = require('../util/fetch.js');

const imgRoot = `https://robertsspaceindustries.com`;
const orgMembersURL = `https://robertsspaceindustries.com/api/orgs/getOrgMembers`;

const organizationMembers = async (sid, page = 1) => {
  //Extra Payload options
  //rank (str): The id of the rank to search.
  //role (str): The id of the role to search.
  //main_org (bool): If true, get all the players which is the main organization.

  const payload = {
    symbol: sid,
    search: "",
    pagesize: 32,
    page: page
  }

  const members = {
    status: 1,
    message: 'OK',
    page: page,
  };

  await fetch.run(orgMembersURL, payload).then($ => {
    if (!$) {
      members.status = $;
      members.message = "Members not found";
    throw new Error(members);
    }

    members.data = {
      visible: [],
      redacted: [],
    };

    members.visible = $('li.org-visibility-V').length;
    members.redacted = $('li.org-visibility-R').length;

    for(let i = 0; i < $('li.org-visibility-V').length; i++){
      const roles = [];

      $('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.roles').children('ul.rolelist').children('li.role').each((i, element) => {
        roles.push($(element).text());
      })

      members.data.visible.push({
        main: $('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.roles').children('span.title').text() == "Affiliate" ? false : true,
        display: $('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.frontinfo').children('span.name-wrap').children('span.name').text(),
        handle: $('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.frontinfo').children('span.name-wrap').children('span.nick').text(),
        rank: $('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.frontinfo').children('span.rank').text(),
        roles: roles,
        image: imgRoot+$('li.org-visibility-V').eq(i).children('a').children('span.thumb').children('img').attr('src'),
        stars: parseInt($('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.frontinfo').children('span.ranking-stars').children('span.stars').css('width').substring(0, $('li.org-visibility-V').eq(i).children('a').children('span.right').children('span.frontinfo').children('span.ranking-stars').children('span.stars').css('width').length))/20,
      })
    }
    
    for(let i = 0; i < $('li.org-visibility-R').length; i++){
      members.data.redacted.push({
        display: 'REDACTED',
      })
    }
    
  })
  
  return members;
}

module.exports = organizationMembers; 