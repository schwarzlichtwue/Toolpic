module.exports = {
  cookies2Str(cookiesObj) {
    return Object.entries(cookiesObj).map(property => property.join("=")).join("; ");
  },
  parseCookie(str) {
    const props = str.split(/;\s?/);

    const cookie = {};
    for (let property of props) {
      const [ key, value ] = property.split("=");
      cookie[key] = value;
    }

    return cookie;
  },
  obj2QueryStr(obj) {
    return Object.entries(obj).map(property => property.join("=")).join("&");
  }
};
