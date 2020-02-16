import SuperComponent from '../SuperComponent.js'
import ResourceSpace from './ResourceSpace.js'

import { popup } from '../__components.js'

import { createElement, sha256, emptyElement, openFile } from '../../helpers.js'

const styleSource = 'dist/Components/StockFootage/style.css';

class StockFootage extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;
    // Get original component description
    const component = rendererInstance.data[keyName];

    // List databases from properties
    const { databases } = component.properties;

    var popupShadow;


    const stockResultView = createElement("div", {
      className: "interactives",
      childs: [
        createElement("div", {
          className: "item stock-result",
          childs: [
            createElement("img", {
              attributes: {
                src: component.value
              }
            })
          ],
          eventListeners: [
            {
              type: "click",
              callback() {
                popupShadow = popup("dist/Components/StockFootage/popup.css");

                popupShadow.append(stockMain);

                popupShadow.close = function() {
                  document.body.removeChild(popupShadow.win);
                }
              }
            }
          ]
        }),
        createElement("div", {
          className: "item",
          childs: [
            createElement("img", {
              attributes: {
                src: 'data/resources/icons/cloud-backup-up-arrow.svg'
              }
            })
          ],
          eventListeners: [
            {
              type: "click",
              async callback() {
                const file = await openFile({
                  width: component.properties.width || 1200,
                  height: component.properties.height || 1200,
                  mime: component.properties.mime || 'image/jpeg'
                });

                self.value = file.data;
              }
            }
          ]
        })
      ]
    });

    //const popupShadow = popup();

    //console.log(popupShadow);

    const stockMain = createElement("div", {
      className: "stock-main",
      childs: [
        createElement("div", {
          className: "stock-menu",
          childs: [
            createElement("div", {
              className: "searchbar",
              childs: [
                createElement("input", {
                  className: "input-search",
                  attributes: {
                    "placeholder": "Query",
                    "type": "text"
                  },
                  eventListeners: [
                    {
                      type: "keydown",
                      callback(event) {
                        if (event.key == "Enter") {
                          submitQuery();
                        }
                      }
                    }
                  ]
                }),
                createElement("button", {
                  className: "btn btn-icon btn-search",
                  childs: [
                    createElement("img", {
                      attributes: {
                        src: "data/resources/search.svg"
                      }
                    })
                  ],
                  eventListeners: [
                    {
                      "type": "click",
                      callback(event) {
                        submitQuery();
                      }
                    }
                  ]
                })
              ]
            }),
            createElement("div", {
              className: "btn-group",
              childs: databases.map((databaseDescriptor, i) => {
                return createElement("button", {
                  className: "btn" + (i == 0 ? " active" : "")
                }, databaseDescriptor.label);
              }),
              eventListeners: [
                {
                  "type": "click",
                  callback(event) {
                    const btn = event.target.closest(".btn");

                    try {
                      btn.parentNode.getElementsByClassName("active")[0].classList.remove("active");
                    }
                    catch (e) {}
                    btn.classList.add("active");

                  }
                }
              ]
            })
          ]
        }),
        createElement("div", {
          className: "stock-view",
          childs: [
            createElement("div", {
              className: "spinner-main",
              childs: [
                /*
                <div class="spinner">
                  <div class="double-bounce1"></div>
                  <div class="double-bounce2"></div>
                </div>
                */
                createElement("div", {
                  className: "spinner",
                  childs: [
                    createElement("div", {
                      className: "double-bounce1"
                    }),
                    createElement("div", {
                      className: "double-bounce2"
                    })
                  ]
                })
              ]
            }),
            createElement("ul", {
              className: "item-list",
              childs: []
            })
          ]
        })
      ]
    });

    function submitQuery() {

      const { value } = popupShadow.querySelector(".input-search");

      const list = popupShadow.querySelector(".item-list");

      const spinner = popupShadow.querySelector(".spinner-main");

      emptyElement(list);

      clearInterval(ticker);

      spinner.style.display = "block";

      const database = (() => {
        const activeBtn = popupShadow.querySelector(".btn-group .btn.active");

        const activeDatabaseIndex = Array.from(activeBtn.parentNode.children).indexOf(activeBtn);

        return databases[activeDatabaseIndex];
      })();

      if (database.type in databaseHandlers) {
        databaseHandlers[database.type](database, value, list, popupShadow, self, component).then(function() {
          spinner.style.display = "none";
        });
      }
      else {
        console.error("Requested database type is not supported!");
      }


    }

    // Append input to root element of shadow
    this.root.append(stockResultView);


    //return this.container;
  }
}

const databaseHandlers = {
  async ResourceSpace(databaseDescriptor, searchQuery, list, popupShadow, componentInstance, component) {


    console.log(list);

    /*const privateKey = "b29117e026633c0af8246a1234fb0fbbe0b0672f28e6e232d6c5e5d868e0c58a";
    const user = "Maurice";

    const query = "user=" + user + "&function=do_search&param1=" + searchQuery;

    const sign = await sha256(privateKey + query);

    console.log(sign);*/

    const response = await fetch("php/resourcespace/search_get_previews.php?query=" + searchQuery);

    const jsonResult = await response.json();

    const baseLis = jsonResult.filter(item => item).filter(item => {
      return "url_col" in item;
    });

    console.log(baseLis);


    /**/

    function drawPreviews(listArray, list, count = 50) {
      const start = list.children.length;
      console.log(start);



      const lis = listArray.slice(start, start + count).map(function(item) {
        return createElement("li", {
          className: "item",
          childs: [
            createElement("div", {
              className: "preview-image",
              attributes: {
                style: `
                  background-image: url('${ item.url_col }');
                `
              }
            }),
            createElement("div", {
              className: "label"
            }, item.field8)
          ],
          eventListeners: [
            {
              type: "click",
              async callback() {
                //get_resource_field_data

                console.log(item);

                const previewUrl = item["url_scr"];
                const miniUrl = item["url_thm"];

                popupShadow.close();


                componentInstance.value = previewUrl;

                const previewImg = componentInstance.root.querySelector(".stock-result img");
                previewImg.src = miniUrl;


              }
            }
          ]
        })
      });

      list.append(...lis);
    }

    const lis = drawPreviews(baseLis, list, 500);

    /*ticker = setInterval(function() {
      drawPreviews(baseLis, list, 50);
      console.log(list.children.length, baseLis.length);
      if (list.children.length >= baseLis.length) {
        console.log("!");
        clearInterval(ticker);
      }
    }, 1000);*/





  },
  async Pexels(databaseDescriptor, searchQuery, list, popupShadow, componentInstance, component) {

    const apiKey = "563492ad6f91700001000001fd927492d5bb4d918cebd637b3838073";

    const perPage = 80;
    const maxRequest = 500;
    const requestsAmount = new Array(Math.ceil(maxRequest / perPage)).fill(true).map((value, index) => {
      return index < Math.trunc(maxRequest / perPage) ? perPage : (maxRequest % perPage);
    });

    for (let i = 0; i < requestsAmount.length; i++) {
      const count = requestsAmount[i];
      await request(count, i);
    }


    async function request(count, index) {
      const url = 'https://api.pexels.com/v1/search?query=' + searchQuery.replace(/\s/g, "+") + '&per_page=' + count + '&page=' + (index + 1);

      const response = await fetch(url, {
        headers: {
          'Authorization': apiKey
        }
      });
      const result = await response.json();
      console.log(result);
      drawPreviews(result.photos, list);
    }


    function drawPreviews(listArray, list) {

      const lis = listArray.map(function(item) {
        return createElement("li", {
          className: "item",
          childs: [
            createElement("div", {
              className: "preview-image",
              attributes: {
                style: `
                  background-image: url('${ item.src.small }');
                `
              }
            }),
            createElement("div", {
              className: "label"
            }, item.field8)
          ],
          eventListeners: [
            {
              type: "click",
              async callback() {
                //get_resource_field_data

                console.log(item);

                const baseUrl = item.src.original;

                const minSize = {
                  w: component.properties.width,
                  h: component.properties.height
                };
                const aimRatio = minSize.h / minSize.w;
                const imgRatio = item.height / item.width;

                /*var minSide;

                if (imgRatio <= aimRatio) {
                  minSide = "height";
                }
                else {
                  minSide = "width";
                }*/

                const minSideName = ["w", "h"][Number(imgRatio <= aimRatio)];

                const specificUrl = item.src.original + "?auto=compress&cs=tinysrgb&" + minSideName + "=" + minSize[minSideName];

                const thumbUrl = item.src.original + "?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=120&w=120";

                popupShadow.close();

                componentInstance.value = specificUrl;

                const previewImg = componentInstance.root.querySelector(".stock-result img");
                previewImg.src = thumbUrl;


              }
            }
          ]
        })
      });

      list.append(...lis);
    }



  },
  async Pixabay(databaseDescriptor, searchQuery, list, popupShadow, componentInstance, component) {

    const apiKey = "15279689-2d59e718147678953b72b30d3";

    const perPage = 200;
    const maxRequest = 500;
    const requestsAmount = new Array(Math.ceil(maxRequest / perPage)).fill(true).map((value, index) => {
      return index < Math.trunc(maxRequest / perPage) ? perPage : (maxRequest % perPage);
    });

    for (let i = 0; i < requestsAmount.length; i++) {
      const count = requestsAmount[i];
      await request(count, i);
    }


    async function request(count, index) {
      const url = 'https://pixabay.com/api/?key=' + apiKey + '&q=' + searchQuery.replace(/\s/g, "+") + '&lang=de&image_type=photo&per_page=' + 200 + '&page=' + (index + 1);
      const response = await fetch(url);
      const result = await response.json();
      drawPreviews(result.hits, list);
    }


    function drawPreviews(listArray, list) {


      const lis = listArray.map(function(item) {
        return createElement("li", {
          className: "item",
          childs: [
            createElement("div", {
              className: "preview-image",
              attributes: {
                style: `
                  background-image: url('${ item.previewURL }');
                `
              }
            }),
            createElement("div", {
              className: "label"
            }, item.field8)
          ],
          eventListeners: [
            {
              type: "click",
              async callback() {

                popupShadow.close();

                componentInstance.value = item.largeImageURL;

                const previewImg = componentInstance.root.querySelector(".stock-result img");
                previewImg.src = item.previewURL;


              }
            }
          ]
        })
      });

      list.append(...lis);
    }
  }
};
var ticker;

export default StockFootage;
