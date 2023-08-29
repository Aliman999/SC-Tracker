const Bottleneck = require("bottleneck");

const player = require('../player/search.js');
const info = require('../organization/search.js');
const members = require('../organization/members.js');

process.setMaxListeners(0);

const api = {
  search: {
    player,
    organization: {
      info,
      members
    }
  }
}

const options = {
  player: {  
    reservoir: 600, // initial value 604
    reservoirIncreaseAmount: 2,
    reservoirIncreaseInterval: 9000, // must be divisible by 250
    reservoirIncreaseMaximum: 40,
    maxConcurrent: 4,
    minTime: 1000,
    timeout: 10000,
  },
  organization: {
    maxConcurrent: 1,
    minTime: 1000,
    timeout: 10000,
  }
};

//Testing 4 different queue methods.
//- Seperate Queue for Players and Organizations and Organization Members
//  REPORT:
//  Seperate Queue for Players and Organizations and Organization Members proved
//  unmanageable because of API throttling.
//
//- Hybrid Queue for Players and Organization Members Seperate for Organization
//  REPORT:
//  Because a seperate queue for players, organizatiokns and organization members proved
//  unmanageable because of API throttling we're forced to use combined queue
//  
//
//- Segregated Queue for Players, Seperate for Organization and Organization Members
//  REPORT:
//  See Previous Reports
//
//- Combined Queue for Players, Organizations and Organization Members
//  REPORT:
//  
//
//  Recording execution and turn around time

//Testing API Rate Limit
const queue = {
  search: {
    pool: new Bottleneck(options.player),
    player: (handle) => {
      return new Promise(callback => {
        queue.search.pool.schedule(api.search.player, handle).then(data => {
          callback(data);
        }).catch(e => {
          callback(e);
        })
      })
    },
    organization: {
      pool: new Bottleneck(options.organization),
      info: (sid) => {
        return new Promise(callback => {
          queue.search.organization.pool.schedule(api.search.organization.info, sid).then(data => {
            callback(data);
          }).catch(e => {
            callback(e);
          })
        })
      },
      members: {
        page: (sid, page= 1) => {
          return new Promise(callback => {
            queue.search.organization.pool.schedule(api.search.organization.members, sid, page).then(data => {
              callback(data)
            }).catch(e => {
              callback(e);
            })
          })
        },
        all: (sid) => {
          let org = {};
          let members = {
            data: {
              visible: [],
              redacted: [],
            },
            visible: 0,
            redacted: 0,
            sid,
          };

          return new Promise(async callback => {
            await queue.search.organization.info(sid).then(async orgObject => {
              org = orgObject;
              for(let i = 1; i <= orgObject.data.pages; i++){
                await queue.search.organization.pool.schedule(api.search.organization.members, orgObject.data.sid, i).then(data => {
                  members.data.visible = Array.from(new Set(members.data.visible.concat(data.data.visible)));
                  members.data.redacted = Array.from(new Set(members.data.redacted.concat(data.data.redacted)));
                  members.visible += data.visible;
                  members.redacted += data.redacted;
                }).catch(e => {
                  callback(e);
                })
              }
            })
            delete members.sid;
            org.members = members;
            callback(org);
          })
        } 
      },
    }
  }
}

queue.search.pool.on('failed', async (error, jobInfo) => {
  const id = jobInfo.options.id;
  console.warn(`Job ${id} failed: ${error}`);

  if (jobInfo.retryCount === 0) {
    console.log(`Retrying job ${id} in 10s!`);
    return 10000;
  }
})

queue.search.organization.pool.on('failed', async (error, jobInfo) => {
  const id = jobInfo.options.id;
  console.warn(`Job ${id} failed: ${error}`);

  if (jobInfo.retryCount === 0) {
    console.log(`Retrying job ${id} in 10s!`);
    return 10000;
  }
})

module.exports = queue;