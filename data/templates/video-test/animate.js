export default function animate(context, anime) {

  const elements = context.querySelectorAll(".testElement1");

  const instance1 = anime({
    targets: elements,
    scale: 3,
    opacity: 1,
    duration: 1500,
    autoplay: false,
    easing: 'easeInOutQuad'
  });

  return [
    instance1
  ];

}
