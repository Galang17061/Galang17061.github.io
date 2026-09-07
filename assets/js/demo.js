/* Strata live-demo launcher.
   GET  -> check whether the demo server is up
   POST -> ask the wake service to start it
   then poll GET every 5s until RUNNING + healthy, and redirect. */
(function () {
  var FN = "https://us-central1-vm-testing-507711.cloudfunctions.net/strata-wake";

  var btn = document.getElementById("launch");
  var status = document.getElementById("launch-status");
  var bar = document.getElementById("launch-progress");
  var fill = bar ? bar.querySelector("i") : null;
  if (!btn || !status || !bar || !fill) return;

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function call(method) {
    return fetch(FN, { method: method }).then(function (r) {
      if (!r.ok) throw new Error("wake service " + r.status);
      return r.json();
    });
  }

  function say(text, isError) {
    status.textContent = text;
    status.classList.toggle("is-error", !!isError);
  }

  function reset() {
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
    bar.classList.remove("is-active");
    fill.style.width = "0%";
  }

  btn.addEventListener("click", async function () {
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    try {
      say("Checking the demo server…");
      var d = await call("GET");
      if (d.status === "RUNNING" && d.healthy) {
        say("Server is already up. Redirecting…");
        location.href = d.app;
        return;
      }

      say("Starting the demo server. This takes about 90 seconds…");
      bar.classList.add("is-active");
      d = await call("POST");

      var t0 = Date.now();
      var budget = 240000;
      while (Date.now() - t0 < budget) {
        await sleep(5000);
        var s = Math.round((Date.now() - t0) / 1000);
        fill.style.width = Math.min(95, (s / 110) * 100) + "%";
        say("Warming up, " + s + "s. Database and app are booting…");
        try {
          d = await call("GET");
          if (d.status === "RUNNING" && d.healthy) {
            fill.style.width = "100%";
            say("Ready. Redirecting…");
            await sleep(600);
            location.href = d.app;
            return;
          }
        } catch (e) { /* keep polling */ }
      }
      throw new Error("timed out");
    } catch (e) {
      say("Couldn't start the demo (" + e.message + "). Try again, or email me and I'll spin it up for you.", true);
      reset();
    }
  });
})();
