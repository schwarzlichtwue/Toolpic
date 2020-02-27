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
      //'data/templates/map1701/template.json',
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
      'data/templates/thanks/template.json',
      'data/templates/video-test/template.json'
    ],
    timestamp: 0,
    __docIndex: 0,
    activeTemplate: null,
    __activeTemplate: null,
    popupOpen: false,
    __renderedBlob: null,
    renderedImage: null,
    __renderedBlobSVG: null,
    __renderedSVG: null,
    progress: {
      handling: 0,
      rendering: 0,
      processing: 0
    }
  },
  asyncComputed: {
    async templates() {
      const fetchings = this.templateUrls.map(url => fetch(url));
      const allPromise = Promise.all((await Promise.all(fetchings)).map(response => response.json()));

      return await allPromise;
    },
    currentProgressKey() {
      for (let key in this.progress) {
        if (this.progress.hasOwnProperty(key)) {
          if (this.progress[key] < 1) {
            return key;
          }
        }
      }
    },
    currentProgress() {
      return this.progress[this.currentProgressKey];
    },
    currProgressLabel() {
      return ({
        "handling": "Handling",
        "rendering": "Rendering",
        "processing": "Processing"
      })[this.currentProgressKey];
    }
  },
  computed: {
    format() {
      return this.__activeTemplate ? (this.__activeTemplate.type ? this.__activeTemplate.type : "png") : null;
    },
    formatType() {
      return this.format == "video" ? "video" : "image";
    }
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
  watch: {
    timestamp(oldValue, newValue) {
      window.myRender.seekAnimations(Number(newValue));
    }
  },
  methods: {
    seek(event) {
      const rangeSlider = event.target.closest("input[type='range']");
      const value = Number(rangeSlider.value);

      window.myRender.seekAnimations(value);
    },
    restartAnimations() {
      window.myRender.restartAnimations();
    },
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
      this.activeTemplate = this.__activeTemplate

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

      const format = (() => {
        return this.__activeTemplate ? (this.__activeTemplate.type ? this.__activeTemplate.type : "png") : null;
      })();

      const timestamp = Date.now();

      const progressChecker = (() => {
        const endpoint = 'https://api.fridaysforfuture.de/progress/' + timestamp;

        return setInterval(async () => {
          const response = await fetch(endpoint);
          const progress = await response.json();

          console.log(progress);

          for (let key in progress) {
            if (progress.hasOwnProperty(key)) {
              this.progress[key] = progress[key];
            }
          }
        }, 1000);
      })();



      const response1 = await fetch(endpoint + "/" + format + "?timestamp=" + timestamp, {
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

      const responseMime = response1.headers.get("Content-Type");

      const blob = await response1.blob();
      const url = URL.createObjectURL(blob);

      clearInterval(progressChecker);

      this.__renderedBlob = blob;
      this.renderedImage = url;
      this.mime = responseMime;

      console.log(this.mime);

      const formatType = (() => {
        return format == "video" ? "video" : "image";
      })();





      if (formatType == "image") {
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
      }

      console.log(this.renderedImage);



    },
    download() {
      if (typeof document.createElement('a').download != "undefined") {
        const mime = this.mime;

        const format = (() => {
          return this.__activeTemplate ? (this.__activeTemplate.type ? this.__activeTemplate.type : "png") : null;
        })();
        const formatType = (() => {
          return format == "video" ? "video" : "image";
        })();

        const ext = formatType == "video" ? this.__activeTemplate.video.extension : format;

        download(this.__renderedBlob, "SharePic." + ext, mime);
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
  },
  components: {
    'progress-circle': {
      props: ["value", "radius"],
      data: function () {
        return {
          transitionDuration: 1000,
          __lastValue: {
            value: 0,
            timestamp: null
          },
          dynVal: 0
        }
      },
      methods: {
        getDynamicValue() {
          const now = Date.now();
          const diffTime = now - this.__lastValue.timestamp;
          const diffVal = this.val - this.__lastValue.value;

          if (diffVal >= 0) {
            const valueProgress = Math.min(diffTime / this.transitionDuration, 1);

            return this.__lastValue.value + diffVal * valueProgress;
          }
          else {
            return this.val;
          }
        }
      },
      computed: {
        val() {
          var val = Number(this.value);
          val = val >= 1 ? 0.99999999 : val;
          return val + 1 > val ? val : 0;
        },
        r() {
          return Number(this.radius) || 50;
        },
        renderValue() {
          return this.dynVal;
        },
        coords() {
          const viewBox = [0, 0, 100, 100];

          const angle = Math.PI * 2 * this.renderValue;


          return {
            x: this.r * Math.sin(angle),
            y: this.r * Math.cos(angle)
          };
        },
        points() {
          return {
            stroked: 'M 0,' + -this.r + ' A ' + this.r + ',' + this.r + ' 0 ' + Number(this.renderValue >= 0.5) + ' 1 ' + this.coords.x + ',' + -this.coords.y,
            filled: 'M 0,0 L 0,' + -this.r + ' A ' + this.r + ',' + this.r + ' 0 ' + Number(this.renderValue >= 0.5) + ' 1 ' + this.coords.x + ',' + -this.coords.y + ' z'
          }
        }
      },
      mounted() {
        console.log(this.coords);
      },
      watch: {
        val(newVal, oldVal) {

          this.__lastValue = {
            value: oldVal,
            timestamp: Date.now()
          }
          var start = null;
          const step = timestamp => {
            if (!start) start = timestamp;
            var progress = timestamp - start;

            this.dynVal = this.getDynamicValue();

            if (progress < this.transitionDuration) {
              window.requestAnimationFrame(step);
            }
          }
          window.requestAnimationFrame(step);
        }
      },
      template: `
        <div class="progress-circle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">
            <path v-bind:d="points.stroked" />
          </svg>
        </div>
      `
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

    window.myRender.restartAnimations();

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
