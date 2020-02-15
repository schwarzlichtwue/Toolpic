const request = require('request');

const { cookies2Str, parseCookie, obj2QueryStr } = require(__dirname + '/helpers.js');

class ResourceSpace {
  static defaultCookies = {

  };
  constructor(options) {
    this.options = options;

    this.token = this.getUserToken();

  }
  download(id) {

    const url = this.getUrl("/pages/download.php", {
      ref: id,
      ext: 'jpg',
      noattach: true,
      page: 1,
      alternative: -1
    });

    return new Promise(async (resolve, reject) => {
      const token = await this.token;
      request(url, {
        method: 'GET',
        encoding: null,
        headers: {
          'Cookie': cookies2Str({
            user: token
          })
        }
      }, function(err, response, body) {
        if (err) return console.error(err);
        console.log(body);
      });
    });

    console.log(url);
  }
  getUserToken() {
    const url = this.getUrl("/login.php");

    const bodyStr = obj2QueryStr({
      username: this.options.username,
      password: this.options.password,
      remember: 'yes'
    });

    return new Promise(function(resolve, reject) {
      request(url, {
        method: 'POST',
        headers: Object.assign(ResourceSpace.defaultCookies, {
          'Content-Length': bodyStr.length,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies2Str({
            cookiecheck: true
          })
        }),
        body: bodyStr
      }, function(err, response, body) {
        if (err) return console.error(err);

        const newCookies = response.headers["set-cookie"].map(parseCookie);

        const userToken = newCookies.find(cookie => {
          // Filter for a MD5 hashed token as 'user' property in cookie (has to be 32 chars because of MD5)
          return "user" in cookie && cookie.user.length == 32;
        }).user;

        resolve(userToken);
      });
    });
  }
  getUrl(endpoint, params = {}) {
    return "https://" + this.options.host + endpoint + "?" + obj2QueryStr(params);
  }
}



module.exports = ResourceSpace;
