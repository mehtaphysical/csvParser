const request = require('superagent');

const getBandcampUrl = username => `https://${username}.bandcamp.com`;

const getBandcampId = username => {
  return request(getBandcampUrl(username))
    .then(res => res.text)
    .then(html => html.match(/id&quot;:(?<id>\d{10})/).groups.id)
    .then(id => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(id)
        }, 200)
      })
    })
}

module.exports = getBandcampId;
