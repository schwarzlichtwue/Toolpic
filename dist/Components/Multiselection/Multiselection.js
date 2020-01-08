import SuperComponent from '../SuperComponent.js'

import { svgContext, openFile, indexOfKeyVal } from '../../helpers.js'

const styleSource = 'dist/Components/Multiselection/style.css';

class MultiselectionComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    const propInfo = rendererInstance.data[keyName];

    this.selected = [];

    const selectionsMain = Object.assign(document.createElement("div"), {
      className: "selections"
    });
    const selectionsList = Object.assign(document.createElement("ul"), {

    });
    const selectionsHead = Object.assign(document.createElement("div"), {
      className: "head"
    });
    const selectionsHeadSearchInput = Object.assign(document.createElement("input"), {
      type: "search"
    });
    selectionsHead.append(selectionsHeadSearchInput);
    selectionsMain.append(selectionsHead, selectionsList);



    const items = propInfo.properties.items.map((item, i) => {
      item.id = i;
      return item;
    }).map(function(itemDecription) {

      const item = document.createElement("li");
      const icon = Object.assign(document.createElement("div"), {
        className: "icon"
      });
      const iconImage = Object.assign(document.createElement("img"), {
        src: itemDecription.render
      });
      icon.append(iconImage);
      const label = Object.assign(document.createElement("div"), {
        className: "label"
      });
      label.append(itemDecription.label);

      item.append(icon, label);

      item.addEventListener("click", function() {
        if (this.classList.contains("selected")) {
          self.remove(this, itemDecription);
        }
        else {
          self.add(this, itemDecription);
        }

        self.value = self.selected;
      });




      return item;
    });

    selectionsList.append(...items);

    selectionsHeadSearchInput.addEventListener("input", function(event) {
      const itemsFittingWithQuery = items.filter(item => item.innerText.search(new RegExp(this.value, "i")) > -1);
      const itemsNotFittingWithQuery = items.filter(item => item.innerText.search(new RegExp(this.value, "i")) == -1);

      for (let item of itemsFittingWithQuery) {
        item.classList.remove("hidden");
      }
      for (let item of itemsNotFittingWithQuery) {
        item.classList.add("hidden");
      }
    });


    // Append input to root element of shadow
    this.root.append(selectionsMain);

    console.log(this.root);

    //return this.container;
  }
  add(e, descriptor) {
    e.classList.add("selected");

    this.selected.push(descriptor);
  }
  remove(e, descriptor) {
    e.classList.remove("selected");

    const descriptorIndex = indexOfKeyVal(this.selected, "id", descriptor.id);

    this.selected[descriptorIndex] = undefined;

    this.selected = this.selected.filter(item => item);
  }
}


export default MultiselectionComponent;
