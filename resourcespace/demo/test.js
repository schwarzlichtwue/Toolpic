const ResourceSpace = require('../');

console.log(ResourceSpace);

const mySpace = new ResourceSpace({
  host: "bilder.fffutu.re",
  username: 'xxx',
  password: 'xxx'
});

(async () => {
  const image1 = await mySpace.download(21677);

  console.log(image1);
})();
