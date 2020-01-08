import SuperComponent from '../SuperComponent.js'

const styleSource = 'dist/Components/Number/style.css';

class NumberComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    const props = self.value.properties;

    // Create input field by passing parameters trough assign()
    const input = Object.assign(document.createElement("input"), {
      type: props.kind == "slider" ? "range" : "number",
      // Default/Start value is the current value of the dataset (mostly the default one)
      value: self.value.value,
      max: props.max,
      min: props.min,
      step: props.step
    });
    // Listen to input event of input field
    input.addEventListener("input", function() {
      // Set dataset
      self.value = this.value;
    });
    // Append input to root element of shadow
    this.root.append(input);

    // If this key changed on rendering instance
    this.on("update", function() {
      // Update input element
      input.value = self.value.value;
    });


    //return this.container;
  }
}


export default NumberComponent;
