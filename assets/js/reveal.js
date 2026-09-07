/* 1. Scroll reveal and viewport-triggered SVG draw: adds .is-in once, then stops watching.
   2. Document index: marks the section currently in view. */
(function () {
  var hasIO = "IntersectionObserver" in window;

  var targets = document.querySelectorAll("[data-reveal], .draw");
  if (targets.length) {
    if (!hasIO) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add("is-in");
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              entries[i].target.classList.add("is-in");
              io.unobserve(entries[i].target);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
      );
      for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
    }
  }

  var links = document.querySelectorAll(".doc-index a[href^='#']");
  if (!links.length || !hasIO) return;
  var byId = {};
  var sections = [];
  for (var k = 0; k < links.length; k++) {
    var id = links[k].getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) { byId[id] = links[k]; sections.push(el); }
  }
  var current = null;
  var spy = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var id = entries[i].target.id;
        if (current) current.removeAttribute("aria-current");
        current = byId[id];
        current.setAttribute("aria-current", "true");
      }
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
  );
  for (var m = 0; m < sections.length; m++) spy.observe(sections[m]);
})();
