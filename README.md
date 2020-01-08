# Toolpic
 Toolpic software of Fridays For Future Germany.

# Structure

The `Rendering` engine and the `Components` object are part of the module namespace object in the `main.js`.

### Example
```javascript
import * as Toolpic from "./dist/main.js"

console.log(Toolpic.Renderer);
console.log(Toolpic.Components);

```

# Renderer

```javascript
// Import Renderer
import Renderer from "./dist/main.js"

const render = new Renderer(template, 0);
```

To initialize a `Renderer`, pass the template description object (same as content of `template.json`) and the index of the format document you want to render.

## Events

### load

```javascript
render.once("load", function() {
  // Rendering function ready to use
});

```

## Data Receiver

To get or set the data of the rendering instance, use the `data` proxy.

### Get Data

**Important**: If you *get* a property of the `data` proxy, you get an value description object with a lot of more informations as the connected *component*.

```javascript
const myPropertyDescriptor = render.data["myProperty"];

console.log(myPropertyDescriptor);

/*
{
  type: 'Component type',
  description: 'Your Description',
  required: [Array],
  properties: [Array],
  value: <Value>
}
*/
```

You can just *get* properties that are defined within the *template description object*!

### Set Data


```javascript
render.data["myProperty"] = "my String";
```

## Render Context

Within a rendering instance, there exists always a `context` element which is a normal `<svg>` node. This is the element, the magic happens within. You can append it or do what you like to do with it ;-)

```javascript
render.once("load", function() {
  // Append the context svg element to the body
  document.body.append(render.context);
});
```


## Template Description Object

The first argument is a *template description object*, which is just an object literal that describes the template generally. It contains all *format documents* (e.g. *facebook* & *twitter*) and the dynamic properties that will be required during rendering.

It looks like this:

```json
{
  "name": "Date 2",
  "preview": "data/templates/date-2/preview.jpg",
  "type": "jpg",
  "documents": [

  ],
  "fonts": [

  ],
  "fields": [

  ]
}
```

* `name`: String that describes the name of the described template
* `preview`: URL to a preview image that previews the template
* `type`: Primary export format. Mostly `jpg` but in case of a template with alpha `png`
* `documents`: Array that contains objects which describe each format that can be rendered (*Twitter*, *Facebook & Instagram*)
* `fonts`: Array that contains object which describe all required fonts for this template
* `fields`: Array that contains components that are linked to properties of the template

### Field Object

A *field object* contains the general information about the field as the required component class such as `Line`, `Selection` or `Checklist`

#### Structure

```json
{
  "type": "TypeClassName",
  "description": "Description",
  "key": "propName",
  "default": null,
  "required": [true, true],
  "properties": {

  }
}
```

* `type`: Class name of component that shall be connected to (Needs to be valid class name that is exported by `Components`). E.g. `Line`, `Number`, `Checklist`
* `description`: Graphically description text
* `key`: Related property name within the rendering instance's data controller
* `default`: Default value for the rendering instance's data controller
* `required`: Array that describes in which documents this property field will be used. Normally, **do not use** this property, because you should not exclude properties normally.
* `properties`: Object containing properties that are specific for this `type` of component

**The** `type` **property has to be a valid class name of a component class exported to** `Components` **of the module namespace object!**

#### Example

```json
{
  "type": "Number",
  "description": "Position",
  "key": "pos",
  "default": 0,
  "properties": {
    "value": 0,
    "max": 1,
    "min": -1,
    "step": 0.05,
    "kind": "slider"
  }
}
```

**To understand all the others components and their properties, have a look at any** `template.json` **file! :)**

### Font Object

To embed a font to a template, just add it to the `fonts` array. A font description object looks like the following:

```json
{
  "name": "Jost-600",
  "src": "fonts/Jost/Jost-600-Semi.ttf",
  "mime": "font/truetype"
}
```

### Documents

Each template can server different documents (e.g. for twitter or facebook) that have different sizes.
A document is described as the following:


```json
{
  "width": 1200,
  "height": 1200,
  "src": "data/templates/date-2/de/1200x1200.svg",
  "alias": "Facebook, Instagram"
}
```

The properties and used `fields` are always the same in each document.
To **exclude** a property field for a specific document of a template, it is normally used for, use the `required` property within a *field description object*. This is an array with boolean values that describe wether the document with the same index would not use this property.

```javascript
{
  "type": "Line",
  "required": [false, true] // Property field would just be used/displayed while editing the 2nd document, not the 1st
}
```

## Format Document Index

The second argument is a *format description index*, that is just an Integer that describes which format document (described in the *template description object*) will be used.



## Component

A component is always an instance of the `SuperCompontent` class.

### Example

```javascript
const styleSource = 'dist/Components/Line/style.css';

class LineComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    // Create input field by passing parameters trough assign()
    const input = Object.assign(document.createElement("input"), {
      type: "text",
      // Default/Start value is the current value of the dataset (mostly the default one)
      value: self.value.value
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

```

## Initialization

To initialize a *component*, pass a *keyName* and a related *Rendering instance* to the class constructor. This connects the *Rendering instance* to the createc component.

```javascript
// MyComponent is a constructor for a random component

const myComponent = new MyComponent('keyname', rendererInstance);
```

## Data

To *set* & *get* data, use the `value` property of each component.

### [Setter] value

```javascript
// myComponent is the instance of a component

myComponent.value = `Foo bar`;
```

### [Getter] value

```javascript
// myComponent is the instance of a component

const val = myComponent.value;

// This is not the direct value but an value description object from the Rendering instance
console.log(val); // Prints 'Foo bar'

// 'Real' value as typed in
console.log(val.value);
```

### Event update

If the connected property of a component changes within the Rendering instance, the `update` event fires.

```javascript
// myComponent is the instance of a component

myComponent.on("update", function() {
  // Log new value
  console.log(myComponent.value.value);
});
```

## Sounds complicated?

Just have a look at this example of the default `Line` component:


```javascript
import SuperComponent from '../SuperComponent.js'

const styleSource = 'dist/Components/Line/style.css';

class LineComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    // Create input field by passing parameters trough assign()
    const input = Object.assign(document.createElement("input"), {
      type: "text",
      // Default/Start value is the current value of the dataset (mostly the default one)
      value: self.value.value
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

  }
}


export default LineComponent;
```


# Templating

As described above, your rendering instance (instance of `Renderer`) conatins a `data` receiver that can be connected to components you create from the `template.json` file or, in theory, be modified manually by using any third party routine.

The `context` is not just any SVG element but a living **Vue.js** environment. Within this context you can access all the properties of the `data` receiver of your instance as native javascript expressions just as **Vue.js** it does.
For example, you could use a property value of a property that is binded to a `Line` component just using the typically Vue.js bracktes `{{ myTextProp }}` or bind it to any attribute using `v-bind:arg="myTextprop"`. At this point, it is not our work but the way **Vue.js** works.

## Directives

Theoretically you could set every possible mathematically relation just using the properties and **Vue.js**. **But** sometimes this would need expressions that are too long to handle. Some of these situations are solved by *Toolpic Directives*.

That means, within your **Vue.js** environment (`context` SVG node) you can use some static directives:

### v-dynamic

`v-dynamic` is a pretty cool directive that handles a dynamic size of any element you want to.
In detail, this means that the element scales up to a **maximum width** or a **maximum height** but never gets bigger than any of them.

```xml
<g v-dynamic data-dynamic-width="1100" data-dynamic-height="700" style="transform-origin: 50% 50%;">
  <!--any content here-->
  <text style="font-size: 42px; alignment-baseline: middle; text-anchor: middle;" x="50%" y="50%">
    My dynamic Text
  </text>
  <!--any content here-->
</g>
```

This is very cool to use if you have an element that has a dynamic size, you do not know when developing a template (Mostly text elements).


### v-fitimage

Often, a background image has to be fitted into the graphic as `background-size: cover` would normally do. Because this is not offered by SVG, you can use the `v-fitimage` directive to get the same result.

```xml
<image href="URL" v-fitimage data-image-pos="0" style="transform-origin: 50% 50%;" />
```

`data-image-pos` is the position of the image relative to its own size. It is a value between `-1` and `1` (`-1` = 100% left or top and `1` 100% right or bottom). The `transform-origin` should always be at center because, `transform` methods are used to scale and fit the image.

## Custom Components

Some other routines are solved with *Vue.js Custom Components*. As the directives, you can access these custom elements within the Vue.js environment.

### Multline Text

Often, you have a an array of text lines that need to be formatted correctly. Because SVG does not offer any clean solution, you would need to create a Vue `v-for` loop each time that handles the padding, margin, line height and all the other stuff.

To automate this routine, you can use the `<multiline-text>` component. Here, you can pass everything you need just using attributes.

```xml
<multiline-text x="30" y="40" padding="10 15" text="['Line 1', 'Line 2']" lineheight="1.1" background="#1DA64A" verticalalign="center" css="font-size: 52px; font-family: 'Jost-400'; fill: #fff;"></multiline-text>
```

* `verticalalign`: `center` -> centered
* `align`: `right`: -> right orientated
* `lineheight`: Line height
* `text`: Array containing all lines
* `background`: Background color of rect
* `padding`: Padding to background rect
* `css`: Stylesheet for the `<text>` element behind the magic


If `verticalalign` **is not** `center`: If the `y` value is `> 0`, it will be interpreted as top reference point. If it is `< 0`, it will be interpreted as bottom reference point.


## Custom methods

To control data in a routine way, you can use some custom methods that can be accessed within the Vue environment just as the directives or the custom components.

### textToMultilineFormat()

This method takes a given multiline text (Array) to a specific graphically ratio. That means, you do not have to care the user about when to set a linebreak to fit in perfectly into a 1:1 or 16:9 image. For example, it is used within the `Quote` template in which the typed quote has to fit into the image perfectly and a user is not abled to decice the linebreaks while writing the quote.

```javascript
textToMultilineFormat('This is a very long text that is just written down without thinking about potencial linebreaks', 1, 0.3, true)
```

1. `String` that should be formatted to the given ratio (e.g. `1`)
2. Ratio the text has to be formatted to
3. *Chars per line*: Value about the average ratio of each char in the used font (e.g. `0.3` - `0.4`). This depends to the font and is just an average value.
4. Boolean wether a more correct algorithm should be used. Just use `false` if this seems to be to slow when using `true`
