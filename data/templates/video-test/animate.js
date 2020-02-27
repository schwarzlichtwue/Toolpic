export default function animate(context, anime, data) {

  const elements = new Array()
  .concat(...[
    //context.querySelectorAll("svg"),
    context.querySelectorAll(".testElement1")
  ]);

  const instance1 = anime({
    targets: elements,
    scale: 5,
    opacity: 1,
    duration: 1500,
    autoplay: false,
    easing: 'easeInOutQuad'
  });

  return [
    instance1
  ];

}
