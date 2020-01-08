import SuperComponent from '../SuperComponent.js'

const styleSource = 'dist/Components/Text/style.css';

class TextComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);


    // Create textarea field by passing parameters trough assign()
    const textarea = Object.assign(document.createElement("textarea"), {
      // Default/Start value is the current value of the dataset (mostly the default one)
      value: rendererInstance.data[keyName].value.join("\n")
    });

    // Listen to input event of input field
    textarea.addEventListener("input", function() {
      // Set dataset
      rendererInstance.data[keyName] = this.value.split("\n");
    });
    // Append input to root element of shadow
    this.root.append(textarea);

    // If this key changed on rendering instance
    this.on("update", function() {
      // Update input element
      textarea.value = rendererInstance.data[keyName].value.join("\n")
    });


    //return this.container;
  }
}


export default TextComponent;
