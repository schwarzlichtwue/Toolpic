import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.esm.browser.js'
import EventEmitter from './EventEmitter/EventEmitter.js'

import { Uint8ToBase64, getDigits } from './helpers.js'

import * as helpers from './vue-resources/vue-helpers/__index.js'
import * as directives from './vue-resources/vue-directives/__index.js'
import * as customComponents from './vue-resources/vue-components/__index.js'

const components = (function() {
  const componentsObj = Object.assign(customComponents);
  const compObj = {};
  for (let key in componentsObj) {
    const component = componentsObj[key];
    compObj[component.tagName] = component.component;
  }
  return compObj;
})();




export default class Renderer extends EventEmitter {
  constructor(template, docIndex = 0) {
    super();

    this.__template = template;
    this.__init();

    this.loadDoc(docIndex).then(() => {
      // Create 'load' event for beeing fully initialized
      this.emit("load");
      // Force an Vue update (because fonts now loaded)
      this.Vue.$forceUpdate();
    });


  }
  __init() {
    const self = this;

    this.__contextContainer = document.createElement("div");

    const fieldsObject = {};
    for (let field of this.__template.fields) {
      fieldsObject[field.key] = field;
    }

    // Using a proxy to interact with the vue instance from outside
    // This is because we can serve a lot of information such as 'description' & 'type' ([Getter]) but keep the setting API easy ([Setter])
    this.data = new Proxy(fieldsObject, {
      get(obj, propName, receiver) {
        // Trying to get a field whose 'key' is the requested property name
        const field = obj[propName];
        // If such an entry exist within the template 'fields' array, return a responce object
        if (field) {
          // Response object that returns important properties about the (existing) requested property
          return {
            // Just fill these properties with the same from the 'field' descriptor object
            type: field.type,
            description: field.description,
            required: field.required || new Array(self.__template.documents.length).fill(true),
            properties: field.properties,
            // Get value from Vue's instance or the default value
            value: "Vue" in self ? ((propName in self.Vue) ? self.Vue[propName] : field.default) : field.default
          };
        }
        else {
          throw console.error("Cannot get property '" + propName + "'. Property is not defined as field in the template");
        }
      },
      has(target, key) {
        return key in target;
      },
      set(obj, propName, value) {
        // Trying to get a field whose 'key' is the requested property name
        const field = obj[propName];
        // If such an entry exist within the template 'fields' array, return a responce object
        if (field) {
          // Set value to Vue instance
          self.Vue[propName] = value;

          self.emit("set", {
            key: propName,
            value: value
          });

          return true;
        }
        else {
          throw console.error("Cannot set property '" + propName + "'. No field found with this property name as key.");
        }
      }
    });
  }
  async loadDoc(index) {
    // Load SVG document as text
    const doc = await (await fetch(this.__template.documents[index].src)).text();

    // Set SVG context to inner of container element
    this.__contextContainer.innerHTML = doc;

    const ctx = this.context;

    console.log(!!ctx);

    // Get group with class name 'main' as main vue element in which the vue magic will happen
    const vueMainGroup = ctx.getElementsByClassName("main")[0];

    const defsContainer = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    console.log(!!this.context);

    if (this.context) {
      this.context.insertBefore(defsContainer, vueMainGroup);
    }

    Renderer.createFontSheet(this.__template.fonts).then(fontSheet => {
      defsContainer.append(fontSheet);
      this.Vue.$forceUpdate();
    });

    // Initalize Vue.js Instance with
    this.Vue = new Vue({
      el: vueMainGroup,
      data: (() => {
        // Fill up data object with the values gotten by the 'data' API
        const dataObj = {};
        for (let key in this.data) {
          dataObj[key] = this.data[key].value;
        }
        return dataObj;
      })(),
      methods: Object.assign({
        getDigits
      }, helpers),
      directives: Object.assign({}, directives),
      components: components
    });




  }
  get context() {
    return this.__contextContainer.getElementsByTagName("svg")[0];
  }
  static async createFontSheet(fonts) {
    const fontSheet = document.createElement("style");

    const fontFaces = (fonts || []).map(async fontObj => {
      const result = await (await fetch(fontObj.src)).arrayBuffer();
      const byteArray = new Uint8Array(result);
      const base64Str = Uint8ToBase64(byteArray);

      const dataURL = 'data:' + fontObj.mime + ";base64," + base64Str;

      return `
        @font-face {
          font-family: "${ fontObj.name }";
          src: url("${ dataURL }");
        }
      `;
    });

    const fontsStr = (await Promise.all(fontFaces)).join("\n");
    fontSheet.innerHTML = fontsStr;

    return fontSheet;
  }
}


Array.prototype.indexOfKeyVal = function(keyName, value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][keyName] == value) {
      return i;
    }
  }
};
Array.prototype.objByKeyVal = function(keyName, value) {
  return this[this.indexOfKeyVal(keyName, value)];
};
