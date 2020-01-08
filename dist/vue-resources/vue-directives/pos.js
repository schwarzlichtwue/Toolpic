const posDirective = {
  inserted: async function(el, binding) {

    var observer = new MutationObserver(function(mutations) {
      posDirective.updated(el, binding);
    });


    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-pos', 'data-rel']
    });

    posDirective.updated(el, binding);
  },
  updated: async function(el, binding) {
    const pos = el.getAttributeNS(null, "data-pos").split(" ").map(Number);
    const rel = el.getAttributeNS(null, "data-rel").split(" ").map(Number);

    // Hack to wait until EL is rendered successfully
    /*while (el.getBBox().width + el.getBBox().height == 0) {
      await new Promise(function(resolve, reject) {
        setTimeout(resolve, 0);
      });
    }*/

    await new Promise(function(resolve, reject) {
      setTimeout(resolve, 100);
    });

    const boundings = el.getBBox();

    const relPoint = {
      x: boundings.x + boundings.width * rel[0],
      y: boundings.y + boundings.height * rel[1]
    };

    const diff = {
      x: pos[0] - relPoint.x,
      y: pos[1] - relPoint.y
    };

    console.log(el);

    el.style.transform = 'translate(' + diff.x + 'px, ' + diff.y + 'px)';

  }
};

export default posDirective;
