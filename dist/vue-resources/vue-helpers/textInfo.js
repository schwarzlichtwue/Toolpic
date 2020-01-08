export default function textInfo(str, style) {

  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  for (let propName in style) {
    if (style.hasOwnProperty(propName)) {
      ctx[propName] = style[propName];
    }
  }
  const txt = str;
  const res = ctx.measureText(txt);

  const text = document.createElement("span");

  if (typeof style == "object") {
    text.style = `
      font-family: ${ style.fontFamily };
      font-size: ${ style.fontSize };
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      white-space: nowrap;
    `;
  }
  else {
    text.style = `
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      white-space: nowrap;
    ` + style;
  }


  text.innerHTML = str;

  document.body.append(text);

  const bounding = text.getBoundingClientRect();

  const info = {
    width: bounding.width,
    height: bounding.height
  };

  //console.log(str, info);
  //console.log(JSON.stringify(style));

  document.body.removeChild(text);

  return info;
}
