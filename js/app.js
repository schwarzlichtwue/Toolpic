import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.esm.browser.js'
import AsyncComputed from './vue-async-computed.esm.js'
import * as Toolpic from "../dist/main.js"

import { responseToDataUrl, iOS, openTab } from './helper.js'
import download from './download.js'

Vue.use(AsyncComputed);

const app = new Vue({
  el: '.app',
  data: {
    menuOpen: true,
    templateUrls: [
      'data/templates/plakat2102/template.json',
      'data/templates/map1701/template.json',
      //'data/templates/profile/bielefeld1302/template.json',
      'data/templates/date-2/template.json',
      'data/templates/map/template.json',
      'data/templates/date/template.json',
      'data/templates/countdown/template.json',
      'data/templates/checklist/template.json',
      'data/templates/imperative/template.json',
      'data/templates/influence/template.json',
      'data/templates/info/template.json',
      'data/templates/letter/template.json',
      'data/templates/logo/template.json',
      'data/templates/s4f-logo/template.json',
      'data/templates/pride/template.json',
      'data/templates/quote/template.json',
      'data/templates/sentence/template.json',
      //'data/templates/support/template.json',
      //'data/templates/flyer2911/template.json',
      'data/templates/thanks/template.json'
    ],
    __docIndex: 0,
    __activeTemplate: null,
    popupOpen: false,
    __renderedBlob: null,
    renderedImage: null,
    __renderedBlobSVG: null,
    __renderedSVG: null
  },
  asyncComputed: {
    async templates() {
      const fetchings = this.templateUrls.map(url => fetch(url));
      const allPromise = Promise.all((await Promise.all(fetchings)).map(response => response.json()));

      return await allPromise;
    }
  },
  computed: {

  },
  mounted() {
    const loadChecker = setInterval(function() {
      //console.log("!!!");
      if (app.templates) {
        clearInterval(loadChecker);

        const loadTemplateId = Number(location.hash.substring(1));

        if (loadTemplateId) {
          app.openTemplate(loadTemplateId - 1);
        }
      }
    }, 10);
  },
  methods: {
    menuAction() {
      this.menuOpen = !this.menuOpen;
    },
    selectTemplate(event) {
      const self = this;

      const selectedLi = event.target.closest('li');
      // Get index from selected list item
      const templateIndex = Array.from(selectedLi.parentNode.children).indexOf(selectedLi);

      this.openTemplate(templateIndex);
    },
    openTemplate(templateIndex) {
      location.hash = templateIndex + 1;

      const template = this.templates[templateIndex];

      this.__activeTemplate = template;

      this.__render = loadTemplate(template, 0);
      this.__docIndex = 0;

      const docSelector = document.querySelector(".select-doc");
      docSelector.clear();
      docSelector.append(...template.documents.map((doc, i) => {
        const opt = Object.assign(document.createElement("option"), {
          value: i
        });
        opt.append(doc.alias);
        return opt;
      }));
      docSelector.value = 0;

      const self = this;

      docSelector.onchange = () => {
        const index = Number(docSelector.value);
        console.log(index, self);

        self.__render = loadTemplate(self.__activeTemplate, index);

        self.__docIndex = index;
      };

      setTimeout(this.menuAction, 0);
    },
    async exportGraphic() {
      const previewMain = document.querySelector(".preview");
      const svg = previewMain.getElementsByTagName("svg")[0];

      {
        const images = svg.getElementsByTagNameNS("http://www.w3.org/2000/svg", "image");
        for (let image of images) {
          const src = image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
          const response = await fetch(src);

          const dataUrl = await responseToDataUrl(response);

          image.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl);

        }
      }

      const dataset = await (async () => {
        const baseObj = Object.assign({}, (await this.__render).data);
        for (let key in baseObj) {
          if (baseObj.hasOwnProperty(key)) {
            baseObj[key] = baseObj[key].value;
          }
        }
        return baseObj;
      })();

      this.popupOpen = true;
      this.__renderedBlob = null;
      this.renderedImage = null;

      const endpoint = 'https://api.fridaysforfuture.de/emulate';
      //const endpoint = 'http://localhost:443/emulate'

      const format = this.__activeTemplate.type ? this.__activeTemplate.type : "png";

      const response1 = fetch(endpoint + "/" + format, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: this.__activeTemplate,
          doc: this.__docIndex,
          data: dataset,
          renderings: 1,
          delay: 250
        })
      });

      console.log(dataset);

      const blob = await (await response1).blob();
      const url = URL.createObjectURL(blob);

      this.__renderedBlob = blob;
      this.renderedImage = url;


        if (dataset.backgroundImage) {
          console.log(dataset.backgroundImage.data.length);
        }




      const response2 = fetch(endpoint + '/svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: this.__activeTemplate,
          doc: this.__docIndex,
          data: dataset,
          renderings: 1,
          delay: 0
        })
      });

      const blob2 = await (await response2).blob();
      const url2 = URL.createObjectURL(blob);

      this.__renderedBlobSVG = blob2;
      this.__renderedSVG = url2;


      /*const svgContext = svg.outerHTML;

      const endpoint = 'https://api.fridaysforfuture.de:65324/render/png'
      const response = fetch(endpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'image/svg+xml'
        },
        body: svgContext
      });

      this.popupOpen = true;
      this.__renderedBlob = null;
      this.renderedImage = null;

      const blob = await (await response).blob();
      const url = URL.createObjectURL(blob);*/






      console.log(this.renderedImage);



    },
    download() {
      if (typeof document.createElement('a').download != "undefined") {
        const mime = this.__activeTemplate.type == "jpg" ? "image/jpeg" : "image/png";
        const format = this.__activeTemplate.type || "png";

        download(this.__renderedBlob, "SharePic." + format, mime);
      }
      else {
        console.log("No support", this.renderedImage);
        //openTab(this.renderedImage);
        window.open(this.renderedImage, '_blank');
      }
    },
    svgDownload() {
      if (typeof document.createElement('a').download != "undefined") {
        download(this.__renderedBlobSVG, "SharePic.svg", "image/svg+xml");
      }
      else {
        console.log("No support", this.renderedImage);
        //openTab(this.renderedImage);
        window.open(this.renderedSVG, '_blank');
      }
    }
  }
});


window.myRender;


async function loadTemplate(template, docIndex = 0) {

  const previewMain = document.querySelector(".preview");
  const componentsList = document.querySelector(".components .components-list");


  previewMain.clear();
  componentsList.clear();

  // Initalize the rendering component
  const render = new Toolpic.Renderer(template, docIndex);

  window.myRender = render;

  render.once("load", function() {

    //render.data.text = ["Was ist bei dir eigentlich falsch?"]

    previewMain.append(render.context);

    function setRenderBoundings() {
      const svg = previewMain.getElementsByTagName("svg")[0];

      const viewBox = svg.getAttribute("viewBox").split(" ").map(Number);
      const bounding = previewMain.getBoundingClientRect();

      const ratioSVG = viewBox[2] / viewBox[3];
      const ratioView = bounding.width / bounding.height;

      if (ratioView >= ratioSVG) {
        // Space left and right
        const offsetX = (bounding.width - (bounding.height * ratioSVG)) / 2;
        const offsetPos = {
          left: offsetX,
          right: bounding.width - offsetX
        };
        previewMain.style.webkitClipPath = 'polygon(' + offsetPos.left + 'px 0, ' + offsetPos.right + 'px 0, ' + offsetPos.right +'px 100%, ' + offsetPos.left + 'px 100%)';
      }
      if (ratioSVG > ratioView) {
        // Space top and bottom
        const offsetY = (bounding.height - (bounding.width * ratioView)) / 2;
        const offsetPos = {
          top: offsetY,
          bottom: bounding.height - offsetY
        };
        previewMain.style.webkitClipPath = 'none';
        //previewMain.style.webkitClipPath = 'polygon(0 ' + offsetPos.top + 'px, 0 ' + offsetPos.bottom + 'px, 100% ' + offsetPos.bottom + 'px, 100% ' + offsetPos.top + 'px)';
      }

    }
    window.addEventListener("resize", setRenderBoundings);
    setRenderBoundings();

  });

  const components = Toolpic.Components.create(render);

  const componentEntries = components.map(component => {
    const container = document.createElement("div");
    const label = Object.assign(document.createElement("span"), {
      className: 'component-label'
    });
    label.append(component.value.description);
    container.append(label, component.container);
    return container;
    //const container =
  });

  componentsList.append(...componentEntries);

  return render;
}


HTMLElement.prototype.clear = function() {
  while (this.childNodes.length > 0) {
    this.removeChild(this.childNodes[0]);
  }
}
