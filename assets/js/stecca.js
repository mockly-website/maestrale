/* Maestrale — la stecca in apertura: i capi arrivati martedì, scontornati e appesi alle grucce.
   Tocchi un capo e va al centro; gli altri scivolano ai lati e si sfocano.
   Col dito si scorre, col mouse si clicca o si usano le frecce, da tastiera le frecce. */
(function () {
  "use strict";
  var D = window.MAESTRALE, root = document.getElementById("stecca-viva");
  if (!D || !root) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- La stecca ---------- */
  var capi = D.CAPI.filter(function (p) { return p.cut; }), n = capi.length;
  var stage = root.querySelector(".rack__stage"), track = root.querySelector(".rack__track"), panel = root.querySelector(".rack__info");
  var prev = root.querySelector('[data-rack="-1"]'), next = root.querySelector('[data-rack="1"]');
  track.innerHTML = capi.map(function (p, i) {
    var c = "assets/img/" + p.cut + "-cut-";
    return '<li class="rack__item"><button type="button" class="rack__btn" data-i="' + i + '" tabindex="-1" aria-label="' + p.nome + ", " + D.euro(p.prezzo) + '">' +
      '<img src="' + c + '400.webp" srcset="' + c + "400.webp 400w, " + c + '600.webp 600w" sizes="(min-width: 64em) 300px, 52vw" width="600" height="900" alt="" decoding="async" draggable="false"' +
      (Math.abs(i - Math.floor((n - 1) / 2)) < 4 ? "" : ' loading="lazy"') + "></button></li>";
  }).join("");
  var items = [].slice.call(track.children), btns = items.map(function (li) { return li.firstChild; });
  var sel = Math.floor((n - 1) / 2), size = 0;

  function measure() {
    /* Larghezza del capo al centro: grande al telefono, contenuta al computer */
    size = Math.round(Math.min(stage.clientWidth * .5, 300, (window.innerHeight - 320) * .55));
    size = Math.max(size, 150);
    stage.style.setProperty("--rack-size", size + "px");
    layout(0);
  }
  function layout(drag) {
    var near = size * .5 + size * .27 + 14, far = size * .42;
    items.forEach(function (li, i) {
      var d = i - sel, ad = Math.abs(d), x = 0, sc = 1;
      if (ad) { x = Math.sign(d) * (near + (ad - 1) * far); sc = .52; }
      var hidden = Math.abs(x + drag) > stage.clientWidth * .5 + size;
      li.style.transform = "translateX(calc(-50% + " + (x + drag).toFixed(1) + "px)) scale(" + sc + ")";
      li.style.filter = ad && !reduce ? "blur(" + Math.min(ad * 1.4, 4).toFixed(1) + "px)" : "none";
      li.style.opacity = ad > 5 || hidden ? 0 : ad ? (1 - ad * .1).toFixed(2) : 1;
      li.style.visibility = ad > 5 || hidden ? "hidden" : "visible";
      li.style.zIndex = 50 - ad;
      li.classList.toggle("is-current", !ad);
      btns[i].tabIndex = ad ? -1 : 0;
      btns[i].setAttribute("aria-current", ad ? "false" : "true");
    });
  }
  function sizesHTML(p) {
    return Object.keys(p.taglie).map(function (t) { return p.taglie[t] ? "<span>" + t + "</span>" : '<s aria-hidden="true">' + t + "</s>"; }).join("");
  }
  function info() {
    var p = capi[sel], pezzi = D.pezzi(p), lib = D.disponibili(p);
    var badge = pezzi === 1 ? '<span class="rack__badge rack__badge--last">Ultimo pezzo</span>' : p.nuovo ? '<span class="rack__badge">Arrivato martedì</span>' : "";
    panel.innerHTML =
      '<div class="rack__photo wind">' + D.img(p.img[0], p.w, p.alt, "(min-width: 64em) 9rem, 6.5rem", true, "") + "</div>" +
      '<div class="rack__text"><p class="rack__count">' + (sel + 1) + " di " + n + " · " + p.tipo + badge + "</p>" +
      '<h2 class="rack__name">' + p.nome + "</h2>" +
      '<p class="rack__meta"><span class="rack__price">' + D.euro(p.prezzo) + '</span><span class="rack__color"><span class="swatch" style="background:' + D.COLORI[p.colore].hex + '" aria-hidden="true"></span>' + D.COLORI[p.colore].nome + "</span></p>" +
      '<p class="rack__sizes"><span class="sr-only">Taglie disponibili: ' + lib.join(", ") + '</span><span aria-hidden="true">' + sizesHTML(p) + "</span></p>" +
      '<a class="btn" href="prodotto.html?id=' + p.id + '">Vedi il capo</a></div>';
    prev.disabled = sel === 0; next.disabled = sel === n - 1;
  }
  function go(i, focus) {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === sel) return;
    sel = i; layout(0); info();
    if (focus) btns[sel].focus({ preventScroll: true });
  }
  btns.forEach(function (b, i) {
    b.addEventListener("click", function () {
      if (moved) return;
      if (i === sel) location.href = "prodotto.html?id=" + capi[i].id; else go(i);
    });
  });
  prev.addEventListener("click", function () { go(sel - 1); });
  next.addEventListener("click", function () { go(sel + 1); });
  track.addEventListener("keydown", function (e) {
    var k = { ArrowLeft: -1, ArrowRight: 1, Home: -n, End: n }[e.key];
    if (k) { e.preventDefault(); go(sel + k, true); }
  });

  /* Col dito (o trascinando col mouse): la stecca segue, poi si ferma sul capo più vicino */
  var x0 = 0, y0 = 0, dx = 0, down = false, moved = false, horiz = null;
  stage.addEventListener("pointerdown", function (e) {
    if (e.button) return;
    down = true; moved = false; horiz = null; x0 = e.clientX; y0 = e.clientY; dx = 0;
  });
  window.addEventListener("pointermove", function (e) {
    if (!down) return;
    var mx = e.clientX - x0, my = e.clientY - y0;
    if (horiz === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) horiz = Math.abs(mx) > Math.abs(my);
    if (!horiz) return;
    moved = true; dx = mx; stage.classList.add("is-dragging"); layout(dx);
  });
  function end() {
    if (!down) return;
    down = false; stage.classList.remove("is-dragging");
    if (moved) {
      var step = Math.round(-dx / (size * .42));
      if (!step && Math.abs(dx) > 40) step = dx < 0 ? 1 : -1;
      if (step) go(sel + step); else layout(0);
      setTimeout(function () { moved = false; }, 0);
    }
  }
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  stage.addEventListener("dragstart", function (e) { e.preventDefault(); });

  root.classList.add("is-on");
  window.addEventListener("resize", measure);
  measure(); info();
})();
