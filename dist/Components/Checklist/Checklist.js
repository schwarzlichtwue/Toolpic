import SuperComponent from '../SuperComponent.js'

const styleSource = 'dist/Components/Checklist/style.css';

class ChecklistComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    const props = self.value.properties;

    const defaultVal = self.value.value;

    const checkFragments = props.fields.map((fieldLabel, index) => {
      const span = Object.assign(document.createElement("span"), {
        className: 'checkbox-label'
      });
      span.append(fieldLabel);

      const checkbox = Object.assign(document.createElement("input"), {
        type: "checkbox",
        checked: defaultVal[index]
      });
      checkbox.addEventListener("change", function() {
        // Copy current array of values
        const val = Array.from(self.value.value);
        // Set this check value to checked state of checkbox
        val[index] = this.checked;

        // Rewrite array of values
        self.value = val;
      });

      const fragment = document.createDocumentFragment();
      fragment.append(span, checkbox);

      return fragment;
    });

    // Append input to root element of shadow
    this.root.append(...checkFragments);


    /*console.log(self.value.value);

    // Create input field by passing parameters trough assign()
    const input = Object.assign(document.createElement("input"), {
      type: "checkbox",
      // Default/Start value is the current value of the dataset (mostly the default one)
      checked: self.value.value
    });
    // Listen to input event of input field
    input.addEventListener("input", function() {
      // Set dataset
      console.log(this.checked);
      self.value = this.checked;
    });
    // Append input to root element of shadow
    this.root.append(input);

    // If this key changed on rendering instance
    this.on("update", function() {
      // Update input element
      input.checked = self.value.value;
    });*/


    //return this.container;
  }
}


export default ChecklistComponent;
