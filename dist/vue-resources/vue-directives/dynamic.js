const dynamicDirective = {
  // directive definition
  inserted: function (el, binding) {

    const bounding = el.getBBox();

    const originAttrVal = el.getAttributeNS(null, "data-dynamic-origin");

    if (originAttrVal && originAttrVal.match(/[0-9]*.*\s[0-9]*.*/)) {
      // Get origin positions from attribute described as object
      const originRelative = originAttrVal.split(" ").map(posStr => {
        const strMatch = posStr.match(/([0-9]*)(.*)/);
        return {
          value: new Number(strMatch[1]) + 0,
          unit: strMatch[2]
        };
      });

      // Function to convert different kinds of units to an absolute number of pixels from a origin object
      function originToAbsolutePx(originPosObj) {
        // Handlers for specific units
        const unitHandlers = {
          ["%"](value) {
            return bounding.width * (value / 100);
          },
          ["px"](value) {
            return value;
          }
        };
        // If the requested unit is supported by the handlers
        if (originPosObj.unit in unitHandlers) {
          // Return the result of the handler method
          return unitHandlers[originPosObj.unit](originPosObj.value);
        }
      }
      // Object describing the absolute pixels of the element's origin
      const origin = {
        x: bounding.x + originToAbsolutePx(originRelative[0]),
        y: bounding.y + originToAbsolutePx(originRelative[1])
      };


      el.style.transformOrigin = origin.x + 'px ' + origin.y + 'px';
    }

    dynamicDirective.update(el, binding);
  },
  update: function (el, binding) {
    setTimeout(() => {

      const width = el.getAttributeNS(null, "data-dynamic-width");
      const height = el.getAttributeNS(null, "data-dynamic-height");

      const bounding = el.getBBox();

      // Required scales to reach max width / height
      const scales = {
        x: width / bounding.width,
        y: height / bounding.height
      };

      //console.log(el, bounding.width, bounding.height);

      // Scale to smaller scale (to prevent oversizing)
      el.style.transform = 'scale(' + Math.min(scales.x, scales.y) + ')';
    });



  }
}

export default dynamicDirective;
