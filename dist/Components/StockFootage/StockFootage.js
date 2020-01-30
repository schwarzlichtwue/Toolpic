import SuperComponent from '../SuperComponent.js'
import ResourceSpace from './ResourceSpace.js'

import { popup } from '../__components.js'

import { createElement, sha256, emptyElement } from '../../helpers.js'

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
      className: "stock-result",
      childs: [
        createElement("img", {
          attributes: {
            src: component.value.data
          }
        })
      ],
      eventListeners: [
        {
          type: "click",
          callback() {
            popupShadow = popup("dist/Components/StockFootage/popup.css");

            popupShadow.append(stockMain);
          }
        }
      ]
    })

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

      spinner.style.display = "block";

      const database = (() => {
        const activeBtn = popupShadow.querySelector(".btn-group .btn.active");

        const activeDatabaseIndex = Array.from(activeBtn.parentNode.children).indexOf(activeBtn);

        return databases[activeDatabaseIndex];
      })();

      if (database.type in databaseHandlers) {
        databaseHandlers[database.type](database, value, list).then(function() {
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
  async ResourceSpace(databaseDescriptor, searchQuery, list) {

    console.log(list);

    /*const privateKey = "b29117e026633c0af8246a1234fb0fbbe0b0672f28e6e232d6c5e5d868e0c58a";
    const user = "Maurice";

    const query = "user=" + user + "&function=do_search&param1=" + searchQuery;

    const sign = await sha256(privateKey + query);

    console.log(sign);*/

    const response = await fetch("php/resourcespace/search_get_previews.php?query=" + searchQuery);

    const jsonResult = await response.json();

    list.result = jsonResult;



    /**/

    function drawPreviews(listArray, list, count = 50) {
      const start = list.children.length;
      console.log(start);

      const lis = listArray.slice(start, start + count).filter(item => {

        return "url_col" in item;
      }).map(function(item) {
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

                const response = await fetch("php/resourcespace/get_resource_path.php?id=" + item.ref);

                const jsonResult = await response.json();

                const url = "https://" + databaseDescriptor.host + jsonResult;

                console.log(url);
              }
            }
          ]
        })
      });

      list.append(...lis);
    }

    const lis = drawPreviews(list.result, list, 50);

    setInterval(function() {
      drawPreviews(list.result, list, 50);
      if (list.children.length >= list.result.length) {
        clearInterval(this);
      }
    }, 1000);





  }
};

export default StockFootage;
