import { imageInfo } from "../vue-helpers/__index.js"



const fitImageDirective = {
  inserted: async function(el, binding) {

    el.setAttributeNS(null, "width", "100%");
    el.setAttributeNS(null, "height", "100%");

    fitImageDirective.update(el, binding);

  },
  update: async function(el, binding) {

    const svgRoot = el.closest("svg");
    const viewBox = svgRoot.getAttribute("viewBox").split(" ").map(numberStr => parseInt(numberStr));
    const [width, height] = viewBox.slice(2);
    const size = Math.max(width, height);

    const viewBoxRatio = width / height;



    // Get current src attribute value of image element
    const imgSrc = el.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    // If current src is not the stored one, the src changed
    if (imgSrc != el.__imgSrc) {
      // Src was changed
      // Update stored src
      el.__imgSrc = imgSrc;
      // Save image information from current src
      el.imgInfo = await imageInfo(imgSrc);

    }

    if (!el.imgInfo) {
      el.imgInfo = await imageInfo(imgSrc);
    }


    const scaleFactor = el.imgInfo.ratio / viewBoxRatio;


    const relScaleFactor = Math.max(el.imgInfo.ratio, viewBoxRatio) / Math.min(el.imgInfo.ratio, viewBoxRatio);

    const overlay = [height, width][(scaleFactor == relScaleFactor) * 1] * (relScaleFactor - 1);

    const overlayOnEachSide = overlay / 2;
    const relOverlay = overlayOnEachSide / relScaleFactor;


    const translate = {
      x: relOverlay * (scaleFactor == relScaleFactor) * 1,
      y: relOverlay * !(scaleFactor == relScaleFactor) * 1
    };

    const imagePos = new Number(el.getAttributeNS(null, "data-image-pos"));

    el.style.transform = "scale(" + relScaleFactor + ") translate(" + (translate.x * imagePos) + "px, " + (translate.y * imagePos) + "px)";


  }
};

export default fitImageDirective;
