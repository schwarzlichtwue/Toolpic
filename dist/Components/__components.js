import Line from './Line/Line.js'
import Text from './Text/Text.js'
import Selection from './Selection/Selection.js'
import Map from './Map/Map.js'
import FittingMap from './FittingMap/FittingMap.js'
import Number from './Number/Number.js'
import Checklist from './Checklist/Checklist.js'
import Multiselection from './Multiselection/Multiselection.js'

const ComponentsObj = {
  Line,
  Text,
  Selection,
  Map,
  FittingMap,
  Number,
  Checklist,
  Multiselection
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

export { Line, Text, Selection, Map, FittingMap, Number, Checklist, Multiselection }
