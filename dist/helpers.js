import imageInfo from './vue-resources/vue-helpers/imageInfo.js'
import imageCompressor from './vue-resources/vue-helpers/imageCompressor.js'

export function indexOfKeyVal(obj, keyName, value) {
  for (var i = 0; i < obj.length; i++) {
    if (obj[i][keyName] == value) {
      return i;
    }
  }
};
export function objByKeyVal(obj, keyName, value) {
  return obj[indexOfKeyVal(obj, keyName, value)];
};

export function Uint8ToBase64(u8Arr){
  var CHUNK_SIZE = 0x8000; //arbitrary number
  var index = 0;
  var length = u8Arr.length;
  var result = '';
  var slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

export function blobToDataURL(blob) {
  return new Promise(function(resolve, reject) {
    var a = new FileReader();
    a.onload = function(e) {
      resolve(e.target.result);
    }
    a.readAsDataURL(blob);
  });
}

export function emptyElement(e) {
  while (e.children.length > 0) {
    e.removeChild(e.children[0]);
  }
}


export async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

export function wordWrap(str, maxWidth) {
  function testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
  };


  var newLineStr = "\n", done = false, res = '';
  do {
      let found = false;
      // Inserts new line at first whitespace of the line
      for (let i = maxWidth - 1; i >= 0; i--) {
          if (testWhite(str.charAt(i))) {
              res = res + [str.slice(0, i), newLineStr].join('');
              str = str.slice(i + 1);
              found = true;
              break;
          }
      }
      // Inserts new line at maxWidth position, the word is too long to wrap
      if (!found) {
          res += [str.slice(0, maxWidth), newLineStr].join('');
          str = str.slice(maxWidth);
      }

      if (str.length < maxWidth)
          done = true;
  } while (!done);

  return res + str;
}


export function getDigits(number) {

  if (!number) {
    return [];
  }

  const digits = [];

  var index = 0;

  while (number != 0) {
    const digit = number % 10;
    number = Math.trunc(number / 10);
    digits.push({
      digit: digit,
      index: index
    });

    index++;
  }

  return digits.length > 0 ? digits : [{
    digit: 0,
    index: 0
  }];
}


export async function svgContext(url) {
  const svgContext = await (await fetch(url)).text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContext, 'image/svg+xml');

  return doc.querySelector("svg");
}


export function openFile(opts) {

  console.log(opts);

  return new Promise(function(resolve, reject) {
    const hiddenInput = Object.assign(document.createElement("input"), {
      type: 'file'
    });

    document.body.append(hiddenInput);

    hiddenInput.addEventListener("change", async function(event) {
      const file = event.target.files[0];

      console.log(file);

      const imgCompressedInfo = new imageCompressor(file, {
        checkOrientation: true,
        maxWidth: opts.width,
        maxHeight: opts.height,
        minWidth: 0,
        minHeight: 0,
        width: undefined,
        height: undefined,
        quality: 0.5,
        beforeDraw: null,
        drew: null,
        success: async function(result) {
          const dataURL = await blobToDataURL(result);

          const imgInfo = imageInfo(dataURL, opts.mime);


          document.body.removeChild(hiddenInput);

          resolve(imgInfo);

        }
      });

    });
    hiddenInput.click();
  });
}


export function createElement(tagName, options, inner) {
  if (typeof options === "string") options = {
    className: options
  }
  options.attributes = options.attributes == undefined ? {} : options.attributes;
  options.childs = options.childs == undefined ? [] : options.childs;
  if (inner) options.childs.push(document.createTextNode(inner));
  options.eventListeners = options.eventListeners == undefined ? [] : options.eventListeners;
  options.className = options.className == undefined ? "" : options.className;
  var e = document.createElement(tagName);
  e.setAttribute("class", options.className);
  for (var i = 0; i < Object.keys(options.attributes).length; i++) {
    e.setAttribute(Object.keys(options.attributes)[i], options.attributes[Object.keys(options.attributes)[i]]);
  }
  for (let property in options.properties) {
    if (options.properties.hasOwnProperty(property)) {
      e[property] = options.properties[property];
    }
  }
  for (var i = 0; i < options.childs.length; i++) {
    if (typeof options.childs[i] == "string") {
      e.innerHTML += options.childs[i];
    }
    else {
      e.appendChild(options.childs[i]);
    }
  }
  for (var i = 0; i < options.eventListeners.length; i++) {
    e.addEventListener(options.eventListeners[i].type, options.eventListeners[i].callback);
  }
  return e;
}


const nextTick  = (function(window, prefixes, i, p, fnc) {
    while (!fnc && i < prefixes.length) {
        fnc = window[prefixes[i++] + 'equestAnimationFrame'];
    }
    return (fnc && fnc.bind(window)) || window.setImmediate || function(fnc) {window.setTimeout(fnc, 0);};
})(window, 'r webkitR mozR msR oR'.split(' '), 0);

export { nextTick };
