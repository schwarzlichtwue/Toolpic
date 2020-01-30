import EventEmitter from '../EventEmitter/EventEmitter.js'

const symbols = {
  keyName: Symbol('keyName'),
  rendererInstance: Symbol('rendererInstance')
};

export default class Component extends EventEmitter {
  constructor(stylesUrl, keyName, rendererInstance) {
    super();

    const self = this;

    // Create super element
    this.container = document.createElement("div");
    this.container.classList.add("component");
    const shadow = this.container.attachShadow({
      mode: 'open'
    });

    this.__shadow = shadow;

    this[symbols.keyName] = keyName;
    this[symbols.rendererInstance] = rendererInstance;

    // Initalize style sheet
    this.styleSheet = document.createElement("style");
    shadow.append(this.styleSheet);

    // Initalize root element
    this.root = document.createElement("div");
    shadow.append(this.root);

    // Load styles to sheet
    this.loadStyles(stylesUrl);

    // If the rendering instance fires an 'set' event (setted a property)
    rendererInstance.on("set", event => {
      // Wether the setted key is the same as thsi component is connected to
      if (event.key === keyName) {
        // Emit an update event for this component
        //this.emit("update");
      }
    });

    Object.defineProperty(this.container, "value", {
      get() {
        return self.value;
      }
    });



  }
  async loadStyles(url) {
    const styles = await (await fetch(url)).text();
    this.styleSheet.innerHTML = styles;
  }
  get value() {
    return this[symbols.rendererInstance].data[this[symbols.keyName]];
  }
  set value(val) {
    return this[symbols.rendererInstance].data[this[symbols.keyName]] = val;
  }
  update() {
    //this.emit("update");
  }
}
