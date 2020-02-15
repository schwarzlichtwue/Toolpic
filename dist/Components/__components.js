import Line from './Line/Line.js'
import Text from './Text/Text.js'
import Selection from './Selection/Selection.js'
import Map from './Map/Map.js'
import FittingMap from './FittingMap/FittingMap.js'
import Number from './Number/Number.js'
import Checklist from './Checklist/Checklist.js'
import Multiselection from './Multiselection/Multiselection.js'
import StockFootage from './StockFootage/StockFootage.js'

import { createElement } from '../helpers.js'

const ComponentsObj = {
  Line,
  Text,
  Selection,
  Map,
  FittingMap,
  Number,
  Checklist,
  Multiselection,
  StockFootage
}

// Create a list of components by a given rendering instance and configure them ready to use
export function create(renderInstance, description = false) {
  // Loop trough dataset's entries
  return Object.entries(renderInstance.data).map(entry => {
    // Reduce the entry array to the key and the value
    const [ key, value ] = entry;
    // If the entry's type is a valid component
    if (value.type in ComponentsObj) {
      // Return the created component node
      const component = new ComponentsObj[value.type](key, renderInstance);

      if (description) {
        const componentContainer = document.createElement("div");
        const componentDescription = document.createElement("span");
        componentDescription.append(value.description);

        componentContainer.append(componentDescription, new ComponentsObj[value.type](key, renderInstance));

        return componentContainer;
      }
      else {
        return component;
      }
    }

    // Filter the components by their validness (!undefined)
  }).filter(entry => entry);
}
export function createArray(renderInstance, description = false) {
  // Loop trough dataset's entries
  return Object.entries(renderInstance.data).map(entry => {
    // Reduce the entry array to the key and the value
    const [ key, value ] = entry;
    // If the entry's type is a valid component
    if (value.type in ComponentsObj) {
      // Return the created component node
      const component = new ComponentsObj[value.type](key, renderInstance);


      return component;
    }

    // Filter the components by their validness (!undefined)
  }).filter(entry => entry);
}

export function popup(styleSheet) {

  const popupView = createElement("div", {
    className: "popup-view"
  });

  const popupWin = createElement("div", {
    className: "component-popup",
    childs: [
      createElement("div", {
        className: "popup-menu",
        childs: [
          createElement("div", {
            className: "btn-close",
            childs: [
              createElement("img", {
                attributes: {
                  src: 'data/resources/close.svg'
                }
              })
            ],
            eventListeners: [
              {
                type: "click",
                callback() {
                  const animationDuration = parseFloat(window.getComputedStyle(popupWin)["animation-duration"].replace(/[^0-9\.]/g, ""));

                  document.body.removeChild(popupWin);

                  /*
                  popupWin.style["animation-direction"] = "reverse";
                  popupWin.style["animation-name"] = "";
                  popupWin.style["animation-name"] = "hidePopup";

                  setTimeout(function() {
                    document.body.removeChild(popupWin);
                  }, animationDuration * 1000)*/
                }
              }
            ]
          })
        ]
      }),
      popupView
    ]
  });

  const shadow = popupView.attachShadow({
    mode: 'open'
  });
  shadow.win = popupWin;

  const styleElement = document.createElement("style");
  shadow.append(styleElement);

  fetch(styleSheet).then(async function(response) {
    styleElement.innerHTML = await response.text();
  });

  document.body.append(popupWin);

  return shadow;

}

export { Line, Text, Selection, Map, FittingMap, Number, Checklist, Multiselection, StockFootage }
