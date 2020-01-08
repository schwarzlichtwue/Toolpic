import SuperComponent from '../SuperComponent.js'

import { svgContext, openFile } from '../../helpers.js'

const styleSource = 'dist/Components/Selection/style.css';

class TextComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    const propInfo = rendererInstance.data[keyName];

    const selectionsMain = Object.assign(document.createElement("div"), {
      className: 'selections'
    });

    const selections = propInfo.properties.items.map(async item => {
      const itemElement = Object.assign(document.createElement("div"), {
        className: "item"
      });

      const typeHandlers = {
        inner: {
          value() {
            return Object.assign(document.createElement("img"), {
              src: item.render || item.value
            });
          },
          file() {
            return svgContext('data/resources/icons/cloud-backup-up-arrow.svg');
          }
        },
        click: {
          value() {
            return item.value;
          },
          async file() {


            return openFile({
              width: propInfo.properties.width || 1200,
              height: propInfo.properties.height || 1200,
              mime: propInfo.properties.mime || 'image/jpeg'
            });
          }
        }
      };
      itemElement.append(await typeHandlers.inner[item.type]());

      itemElement.addEventListener("click", async function() {
        const value = await typeHandlers.click[item.type]();

        self.value = value;
      });

      // If this key changed on rendering instance
      this.on("update", function() {
        // Update input element

        //input.value = self.value.value;
      });


      return itemElement;
    });

    // Append input to root element of shadow
    this.root.append(selectionsMain);

    Promise.all(selections).then(selectionNodes => {
      selectionsMain.append(...selectionNodes);
    });


    //return this.container;
  }
}


export default TextComponent;
