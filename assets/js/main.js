/* Maestrale — comportamento comune a tutte le pagine. */
(function () {
  "use strict";

  var D = window.MAESTRALE;
  var WA = "https://wa.me/393517578080?text=";
  var KEY = "maestrale-carrello";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var page = document.body.getAttribute("data-page");

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function wa(text) { return WA + encodeURIComponent(text); }

  /* ---------- Carrello salvato nel browser ---------- */
  var memory = [];
  var Cart = {
    read: function () {
      try { var v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v.filter(function (l) { return D.trova(l.id); }) : []; }
      catch (e) { return memory.slice(); }
    },
    write: function (lines) {
      memory = lines.slice();
      try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* navigazione privata: resta in memoria */ }
      document.dispatchEvent(new CustomEvent("cart:change"));
    },
    max: function (id, taglia) { var p = D.trova(id); return p && p.taglie[taglia] ? p.taglie[taglia] : 0; },
    add: function (id, taglia, qty) {
      var lines = Cart.read(), max = Cart.max(id, taglia), line = null;
      lines.forEach(function (l) { if (l.id === id && l.taglia === taglia) line = l; });
      if (!max) return { ok: false, reason: "esaurito" };
      if (line) {
        if (line.qty >= max) return { ok: false, reason: "max", max: max };
        line.qty = Math.min(max, line.qty + (qty || 1));
      } else lines.push({ id: id, taglia: taglia, qty: Math.min(max, qty || 1) });
      Cart.write(lines);
      return { ok: true };
    },
    set: function (i, qty) { var l = Cart.read(); if (!l[i]) return; l[i].qty = Math.max(1, Math.min(Cart.max(l[i].id, l[i].taglia), qty)); Cart.write(l); },
    resize: function (i, t) {
      var l = Cart.read(), line = l[i]; if (!line || line.taglia === t) return;
      var max = Cart.max(line.id, t), other = -1;
      l.forEach(function (x, j) { if (j !== i && x.id === line.id && x.taglia === t) other = j; });
      if (other > -1) { l[other].qty = Math.min(max, l[other].qty + line.qty); l.splice(i, 1); }
      else { line.taglia = t; line.qty = Math.min(max, line.qty); }
      Cart.write(l);
    },
    remove: function (i) { var l = Cart.read(); var out = l.splice(i, 1)[0]; Cart.write(l); return out; },
    insert: function (i, line) { var l = Cart.read(); l.splice(i, 0, line); Cart.write(l); },
    clear: function () { Cart.write([]); },
    count: function () { return Cart.read().reduce(function (a, l) { return a + l.qty; }, 0); },
    total: function () { return Cart.read().reduce(function (a, l) { return a + D.trova(l.id).prezzo * l.qty; }, 0); }
  };
  window.MaestraleCart = Cart;

  function updateCount(bump) {
    var n = Cart.count();
    $$("[data-cart-count]").forEach(function (el) {
      el.textContent = n; el.setAttribute("data-n", n);
      if (bump && !reduce) { el.classList.remove("is-bump"); void el.offsetWidth; el.classList.add("is-bump"); }
    });
    $$("[data-cart-label]").forEach(function (el) { el.textContent = n === 1 ? "1 capo" : n + " capi"; });
    renderThumbbar();
  }
  document.addEventListener("cart:change", function () { updateCount(true); });

  /* ---------- Avviso breve ---------- */
  var toastEl = $(".toast"), toastTimer;
  function toast(msg, action) {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.innerHTML = '<p role="status">' + msg + "</p>";
    if (action) {
      var b = document.createElement(action.href ? "a" : "button");
      b.textContent = action.label;
      if (action.href) b.href = action.href; else { b.type = "button"; b.addEventListener("click", function () { action.run(); hideToast(); }); }
      toastEl.appendChild(b);
    }
    toastEl.classList.add("is-visible");
    toastTimer = setTimeout(hideToast, 4500);
  }
  function hideToast() { toastEl && toastEl.classList.remove("is-visible"); }

  /* ---------- Pannelli (menu e filtri): X, Esc, tocco fuori, fuoco intrappolato ---------- */
  var scrim = $(".scrim"), openPanel = null, lastFocus = null;
  function focusables(el) { return $$('a[href], button:not([disabled]), input:not([disabled]), select, [tabindex="0"]', el).filter(function (x) { return x.offsetParent !== null; }); }
  function open(panel, opener) {
    if (openPanel) close();
    openPanel = panel; lastFocus = opener || document.activeElement;
    panel.classList.add("is-open"); panel.removeAttribute("inert");
    if (scrim) scrim.classList.add("is-open");
    document.body.classList.add("is-locked");
    $$('[aria-controls="' + panel.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    var f = focusables(panel); setTimeout(function () { (f[0] || panel).focus(); }, 60);
  }
  function close() {
    if (!openPanel) return;
    var panel = openPanel; openPanel = null;
    panel.classList.remove("is-open");
    if (panel.hasAttribute("data-inert-closed")) panel.setAttribute("inert", "");
    if (scrim) scrim.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    $$('[aria-controls="' + panel.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("keydown", function (e) {
    if (!openPanel) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "Tab") {
      var f = focusables(openPanel); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  if (scrim) scrim.addEventListener("click", close);
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", function () { var p = document.getElementById(b.getAttribute("aria-controls")); if (p) open(p, b); }); });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", close); });
  var menu = $("#menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    window.matchMedia("(min-width: 64em)").addEventListener("change", function (m) { if (m.matches && openPanel === menu) close(); });
  }
  window.MaestralePanel = { open: open, close: close };

  /* ---------- Barra col pollice ---------- */
  var bar = $(".thumbbar"), barCustom = null;
  function renderThumbbar() {
    if (!bar) return;
    if (barCustom) { barCustom(bar); return; }
    var n = Cart.count();
    var coll = '<a class="btn' + (n ? " btn--ghost" : " btn--accent") + '" href="collezione.html">La collezione</a>';
    var cart = n ? '<a class="btn btn--accent" href="carrello.html">Carrello · ' + n + "</a>" : "";
    bar.innerHTML = (page === "collezione" ? "" : coll) + cart;
    bar.classList.toggle("is-empty", !bar.children.length);
  }
  /* below: true = la barra compare anche quando il bottone vero è ancora più in basso */
  function watchThumbbar(target, below) {
    if (!bar) return;
    if (!target || !("IntersectionObserver" in window)) { bar.classList.add("is-visible"); return; }
    new IntersectionObserver(function (en) {
      var e = en[0];
      bar.classList.toggle("is-visible", !e.isIntersecting && (below || e.boundingClientRect.top < 0));
    }).observe(target);
  }
  window.MaestraleBar = { set: function (fn) { barCustom = fn; renderThumbbar(); }, watch: watchThumbbar };

  /* ---------- Comparsa allo scroll ---------- */
  function revealAll(root) {
    var els = $$(".reveal:not(.is-in)", root);
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Animazione firma: il vento sulle foto ---------- */
  /* Ogni foto è appesa dall'alto come su una gruccia: la velocità dello scroll la piega,
     poi una molla la riporta ferma con un piccolo dondolio. */
  var Wind = (function () {
    var items = new Map(), visible = new Set(), lastY = window.scrollY, vel = 0, running = false, io = null, idx = 0;
    function add(root) {
      if (reduce) return;
      $$(".wind", root).forEach(function (w) {
        if (items.has(w)) return;
        var i = idx++;
        items.set(w, { a: 0, v: 0, k: 0.055 + (i % 3) * 0.012, dir: (i % 2 ? -1 : 1) * (0.75 + (i % 4) * 0.12), imgs: $$("img", w) });
        if (io) io.observe(w);
      });
    }
    function tick() {
      var y = window.scrollY, dy = y - lastY; lastY = y;
      vel += (dy - vel) * 0.22;
      var moving = Math.abs(vel) > 0.05;
      visible.forEach(function (w) {
        var s = items.get(w); if (!s) return;
        var target = Math.max(-2.6, Math.min(2.6, vel * 0.11)) * s.dir;
        s.v += (target - s.a) * s.k; s.v *= 0.86; s.a += s.v;
        if (Math.abs(s.a) > 0.01 || Math.abs(s.v) > 0.01) moving = true;
        var sc = 1.06 + Math.abs(s.a) * 0.03;
        var t = "scale(" + sc.toFixed(4) + ") skewX(" + s.a.toFixed(3) + "deg)";
        for (var j = 0; j < s.imgs.length; j++) s.imgs[j].style.transform = t;
      });
      if (moving) requestAnimationFrame(tick); else { running = false; vel = 0; }
    }
    function kick() { if (!running && !reduce) { running = true; lastY = lastY || window.scrollY; requestAnimationFrame(tick); } }
    if (!reduce && "IntersectionObserver" in window) {
      io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) visible.add(x.target); else visible.delete(x.target); }); }, { rootMargin: "15% 0px" });
      window.addEventListener("scroll", kick, { passive: true });
    }
    return { add: add, kick: kick };
  })();
  window.MaestraleWind = Wind;

  /* ---------- Orari: evidenzia oggi ---------- */
  var today = new Date().getDay();
  $$(".hours [data-day]").forEach(function (li) {
    if (li.getAttribute("data-day").split(",").indexOf(String(today)) > -1) { li.classList.add("is-today"); li.setAttribute("aria-current", "date"); }
  });

  /* ---------- Collegamenti WhatsApp con testo preparato ---------- */
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });

  /* ---------- Pagine ---------- */
  var pages = {};

  pages.home = function () {
    requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add("is-ready"); }); });
    watchThumbbar($(".hero__actions"));

    /* Il look della settimana: tocca un punto, il capo si accende nella lista */
    var look = $("#look");
    if (!look) return;
    var spots = $$(".hotspot", look), items = $$(".look__item", look);
    function select(id) {
      spots.forEach(function (s) { s.setAttribute("aria-pressed", s.getAttribute("data-id") === id ? "true" : "false"); });
      items.forEach(function (it) { it.classList.toggle("is-active", it.getAttribute("data-id") === id); });
    }
    spots.forEach(function (s) {
      s.addEventListener("click", function () {
        var id = s.getAttribute("data-id"), on = s.getAttribute("aria-pressed") === "true";
        select(on ? null : id);
        if (!on && window.matchMedia("(max-width: 47.99em)").matches) {
          var it = $('.look__item[data-id="' + id + '"]', look);
          it && it.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
        }
      });
    });
    function addLook(id, btn) {
      var p = D.trova(id), t = D.preferita(p);
      var r = Cart.add(id, t, 1);
      if (btn) { btn.classList.add("is-done"); btn.setAttribute("aria-label", p.nome + " aggiunto al carrello"); }
      return r.ok || r.reason === "max";
    }
    $$(".look__add", look).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.closest("[data-id]").getAttribute("data-id"), p = D.trova(id);
        select(id);
        addLook(id, b);
        toast(esc(p.nome) + " nel carrello, taglia " + D.preferita(p) + ". La cambi dal carrello.", { label: "Vedi", href: "carrello.html" });
      });
    });
    var all = $("[data-look-all]", look);
    all && all.addEventListener("click", function () {
      items.forEach(function (it) { addLook(it.getAttribute("data-id"), $(".look__add", it)); });
      toast("Tutto il look è nel carrello, in taglia M o la più vicina. Le cambi dal carrello.", { label: "Vedi", href: "carrello.html" });
    });
  };

  pages.collezione = function () {
    var grid = $("#griglia"), form = $("#filtri"), empty = $("#vuoto");
    if (!grid || !form) return;
    watchThumbbar(null);
    var cards = $$(".card", grid), countEl = $("#conteggio"), sortSel = $("#ordina"), badge = $("#filtri-n"), chipsOut = $("#attivi");
    var showBtn = $("[data-show-count]");

    /* Leggi i filtri dall'indirizzo, così si possono mandare a qualcuno */
    var q = new URLSearchParams(location.search);
    (q.get("taglia") || "").split(",").forEach(function (v) { var i = form.querySelector('input[name="taglia"][value="' + v + '"]'); if (i) i.checked = true; });
    (q.get("colore") || "").split(",").forEach(function (v) { var i = form.querySelector('input[name="colore"][value="' + v + '"]'); if (i) i.checked = true; });
    if (q.get("ordine") && sortSel.querySelector('option[value="' + q.get("ordine") + '"]')) sortSel.value = q.get("ordine");

    function values(name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
    function match(c, taglie, colori) {
      var t = c.getAttribute("data-taglie").split(" "), col = c.getAttribute("data-colore");
      return (!taglie.length || taglie.some(function (x) { return t.indexOf(x) > -1; })) && (!colori.length || colori.indexOf(col) > -1);
    }
    function apply(animate) {
      var taglie = values("taglia"), colori = values("colore"), ord = sortSel.value;
      var list = cards.slice();
      if (ord === "prezzo-su") list.sort(function (a, b) { return a.getAttribute("data-prezzo") - b.getAttribute("data-prezzo"); });
      else if (ord === "prezzo-giu") list.sort(function (a, b) { return b.getAttribute("data-prezzo") - a.getAttribute("data-prezzo"); });
      else if (ord === "nuovi") list.sort(function (a, b) { return b.getAttribute("data-nuovo") - a.getAttribute("data-nuovo") || cards.indexOf(a) - cards.indexOf(b); });
      var n = 0;
      list.forEach(function (c) {
        var ok = match(c, taglie, colori);
        c.classList.toggle("is-hidden", !ok);
        grid.appendChild(c);
        if (ok) { c.classList.toggle("card--big", n % 7 === 0); n++; }
        else c.classList.remove("card--big");
        c.classList.add("is-in");
      });
      grid.appendChild(empty);
      empty.hidden = n > 0;
      if (!n) {
        var parts = [];
        if (taglie.length) parts.push("in taglia " + taglie.join(" o "));
        if (colori.length) parts.push("di colore " + colori.map(function (c) { return D.COLORI[c].nome.toLowerCase(); }).join(" o "));
        $("#vuoto-testo").textContent = "Nessun capo " + parts.join(" e ") + ", per ora. Togli un filtro, oppure scrivici: ti avvisiamo se arriva martedì.";
      }
      countEl.innerHTML = "<b>" + n + "</b> " + (n === 1 ? "capo" : "capi");
      if (showBtn) showBtn.textContent = n ? "Mostra " + n + (n === 1 ? " capo" : " capi") : "Nessun capo";
      var active = taglie.length + colori.length;
      badge.textContent = active || "";
      /* Taglie e colori che con gli altri filtri darebbero zero risultati */
      $$('input[name="taglia"]', form).forEach(function (i) { i.disabled = !i.checked && !cards.some(function (c) { return match(c, [i.value], colori); }); });
      $$('input[name="colore"]', form).forEach(function (i) { i.disabled = !i.checked && !cards.some(function (c) { return match(c, taglie, [i.value]); }); });
      chipsOut.innerHTML = taglie.map(function (t) { return '<button type="button" data-k="taglia" data-v="' + t + '" aria-label="Togli la taglia ' + t + '">' + t + "</button>"; }).join("") +
        colori.map(function (c) { return '<button type="button" data-k="colore" data-v="' + c + '" aria-label="Togli il colore ' + D.COLORI[c].nome + '">' + D.COLORI[c].nome + "</button>"; }).join("");
      var p = new URLSearchParams();
      if (taglie.length) p.set("taglia", taglie.join(","));
      if (colori.length) p.set("colore", colori.join(","));
      if (ord !== "scelta") p.set("ordine", ord);
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
      if (animate && !reduce) { grid.classList.remove("is-filtering"); void grid.offsetWidth; grid.classList.add("is-filtering"); }
      Wind.kick();
    }
    form.addEventListener("change", function () { apply(true); });
    sortSel.addEventListener("change", function () { apply(true); });
    chipsOut.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var i = form.querySelector('input[name="' + b.getAttribute("data-k") + '"][value="' + b.getAttribute("data-v") + '"]');
      if (i) { i.checked = false; apply(true); }
    });
    $$("[data-reset]").forEach(function (b) { b.addEventListener("click", function () { $$("input", form).forEach(function (i) { i.checked = false; }); apply(true); }); });
    apply(false);
  };

  pages.prodotto = function () {
    var root = $("#prodotto");
    var id = new URLSearchParams(location.search).get("id") || D.CAPI[0].id;
    var p = D.trova(id);
    if (!p) {
      document.title = "Capo non trovato — Maestrale";
      root.innerHTML = '<div class="notfound"><p class="eyebrow">Errore · capo non trovato</p><h1 class="display">Volato via.</h1>' +
        '<p class="lead">Questo capo non c\'è più, oppure il collegamento è sbagliato. Gli altri sono ancora tutti qui.</p>' +
        '<a class="btn" href="collezione.html">Torna alla collezione</a></div>';
      return;
    }
    var col = D.COLORI[p.colore], tutte = Object.keys(p.taglie), libere = D.disponibili(p);
    document.title = p.nome + " — Maestrale";
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", p.nome + ", " + col.nome.toLowerCase() + ". " + p.materiale + ". Demo di una boutique: prezzi e taglie di esempio.");

    var slides = p.img.map(function (name, i) {
      var alt = i === 0 ? p.alt : (D.ALT2[p.id] || p.alt);
      return '<div class="gallery__slide wind" id="foto-' + (i + 1) + '">' + D.img(name, p.w, alt, "(min-width: 64em) 30vw, (min-width: 48em) 55vw, 100vw", i > 0, "") + "</div>";
    }).join("");
    var dots = p.img.length > 1 ? '<div class="gallery__dots">' + p.img.map(function (_, i) { return '<button type="button" aria-label="Foto ' + (i + 1) + " di " + p.img.length + '"' + (i ? "" : ' aria-current="true"') + ' data-i="' + i + '"></button>'; }).join("") + "</div>" : "";
    var chips = tutte.map(function (t) {
      var n = p.taglie[t];
      return '<label class="chip"><input type="radio" name="taglia" value="' + t + '"' + (n ? "" : " disabled") + (libere.length === 1 && n ? " checked" : "") + '><span>' + t + (n ? "" : '<span class="sr-only"> esaurita</span>') + "</span></label>";
    }).join("");
    var related = D.CAPI.filter(function (x) { return x.id !== p.id && (x.tipo !== p.tipo); }).filter(function (x, i) { return (i + p.prezzo) % 3 === 0; }).slice(0, 4);
    if (related.length < 4) related = D.CAPI.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
    var guide = p.tipo === "Accessori" ? "" : '<button type="button" data-guide>Guida alle taglie</button>';

    root.innerHTML =
      '<nav class="crumbs crumbs--product wrap" aria-label="Sei qui"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="collezione.html">Collezione</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(p.nome) + "</span></nav>" +
      '<article class="product">' +
        '<div class="gallery"><div class="gallery__track' + (p.img.length === 1 ? " is-single" : "") + '" tabindex="0" aria-label="Foto del capo">' + slides + "</div>" + dots + "</div>" +
        '<div class="product__info">' +
          '<p class="product__type">' + p.tipo + (p.nuovo ? " · arrivato martedì" : "") + "</p>" +
          '<h1 class="product__name display">' + esc(p.nome) + "</h1>" +
          '<p class="product__price"><b>' + D.euro(p.prezzo) + "</b><span>Prezzo di esempio</span></p>" +
          '<p class="product__color"><span class="swatch" style="background:' + col.hex + '" aria-hidden="true"></span>Colore: ' + col.nome + "</p>" +
          '<fieldset class="sizes" id="taglie"><legend><span>' + (p.tipo === "Scarpe" ? "Numero" : "Taglia") + "</span>" + guide + '</legend><div class="chips">' + chips + "</div>" +
          '<p class="stock" id="stock" aria-live="polite"></p><p class="error" id="taglia-errore" role="alert"></p></fieldset>' +
          '<div class="product__actions" id="azioni"><button class="btn btn--accent btn--block" type="button" id="aggiungi">Aggiungi al carrello</button>' +
          '<a class="btn btn--ghost btn--block" id="tienimelo" href="#">Tienimelo da parte 48 ore</a></div>' +
          (p.nota ? '<p class="product__note">' + esc(p.nota) + "</p>" : "") +
          '<dl class="details"><div><dt>Tessuto</dt><dd>' + esc(p.materiale) + "</dd></div><div><dt>Come lavarlo</dt><dd>" + esc(p.lavaggio) + "</dd></div><div><dt>Vestibilità</dt><dd>" + esc(p.vestibilita) + "</dd></div>" +
          (p.orlo ? "<div><dt>Orlo</dt><dd>Se è lungo lo accorciamo noi in negozio, in tre giorni.</dd></div>" : "") +
          "<div><dt>Cambio</dt><dd>Entro 14 giorni, con lo scontrino. In questa demo è un esempio.</dd></div></dl>" +
        "</div>" +
      "</article>" +
      '<section class="related wrap" aria-labelledby="abbina"><h2 class="display" id="abbina">Ci sta bene con</h2><ul class="grid">' +
        related.map(function (r) { return D.card(r, { reveal: true }); }).join("") + "</ul></section>" +
      '<dialog class="dialog" id="guida"><div class="dialog__in"><div class="dialog__head"><h2 class="display">Guida alle taglie</h2><button class="icon-btn" type="button" data-close-dialog aria-label="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
        '<p>Misure del corpo in centimetri, di esempio. Se sei tra due taglie, scrivici: ti diciamo noi come veste questo capo.</p>' +
        '<div class="table-wrap"><table><thead><tr><th scope="col">Taglia</th><th scope="col">Seno</th><th scope="col">Vita</th><th scope="col">Fianchi</th></tr></thead><tbody>' +
        "<tr><th scope=\"row\">XS</th><td>80–84</td><td>62–66</td><td>88–92</td></tr><tr><th scope=\"row\">S</th><td>84–88</td><td>66–70</td><td>92–96</td></tr><tr><th scope=\"row\">M</th><td>88–92</td><td>70–74</td><td>96–100</td></tr><tr><th scope=\"row\">L</th><td>92–98</td><td>74–80</td><td>100–106</td></tr><tr><th scope=\"row\">XL</th><td>98–104</td><td>80–86</td><td>106–112</td></tr>" +
        "</tbody></table></div></div></dialog>";

    revealAll(root); Wind.add(root);

    /* Galleria da telefono: i puntini seguono il dito */
    var track = $(".gallery__track", root), dotBtns = $$(".gallery__dots button", root);
    if (dotBtns.length) {
      track.addEventListener("scroll", function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        dotBtns.forEach(function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
      }, { passive: true });
      dotBtns.forEach(function (b) { b.addEventListener("click", function () { track.scrollTo({ left: track.clientWidth * +b.getAttribute("data-i"), behavior: reduce ? "auto" : "smooth" }); }); });
    }

    var sizes = $("#taglie"), err = $("#taglia-errore"), stock = $("#stock"), addBtn = $("#aggiungi"), keep = $("#tienimelo");
    function chosen() { var i = $('input[name="taglia"]:checked', root); return i ? i.value : null; }
    function updateKeep() {
      var t = chosen();
      keep.href = wa("[DEMO — sito dimostrativo di Mockly, la boutique Maestrale è inventata]\nCiao! Potete tenermi da parte per 48 ore questo capo?\n" + p.nome + " · " + col.nome + (t ? " · taglia " + t : "") + " · " + D.euro(p.prezzo));
      keep.target = "_blank"; keep.rel = "noopener";
    }
    function updateStock() {
      var t = chosen();
      if (!t) { stock.textContent = libere.length ? "Disponibile in " + libere.join(", ") + "." : "Esaurito in tutte le taglie."; stock.classList.remove("is-low"); return; }
      var n = p.taglie[t];
      stock.textContent = n === 1 ? "Ultimo pezzo in " + t + "." : "In negozio ne abbiamo " + n + " in " + t + ".";
      stock.classList.toggle("is-low", n === 1);
    }
    root.addEventListener("change", function (e) {
      if (e.target.name === "taglia") { sizes.classList.remove("is-error"); err.textContent = ""; updateStock(); updateKeep(); }
    });
    function add() {
      var t = chosen();
      if (!t) {
        err.textContent = "Scegli prima la " + (p.tipo === "Scarpe" ? "misura" : "taglia") + ".";
        sizes.classList.remove("is-error"); void sizes.offsetWidth; sizes.classList.add("is-error");
        var first = $('input[name="taglia"]:not(:disabled)', root); first && first.focus({ preventScroll: true });
        sizes.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        return;
      }
      var r = Cart.add(p.id, t, 1);
      if (r.ok) toast(esc(p.nome) + ", taglia " + t + ", è nel carrello.", { label: "Vai al carrello", href: "carrello.html" });
      else if (r.reason === "max") toast("Ne hai già " + r.max + " nel carrello: è tutto quello che c'è in " + t + ".", { label: "Carrello", href: "carrello.html" });
    }
    addBtn.addEventListener("click", add);
    var gb = $("[data-guide]", root), dlg = $("#guida");
    if (gb && dlg && dlg.showModal) {
      gb.addEventListener("click", function () { dlg.showModal(); });
      $("[data-close-dialog]", dlg).addEventListener("click", function () { dlg.close(); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    } else if (gb) gb.remove();
    updateStock(); updateKeep();

    /* Da telefono, quando il bottone esce dallo schermo resta in basso */
    MaestraleBar.set(function (b) {
      b.innerHTML = '<button class="btn btn--accent" type="button">Aggiungi · ' + D.euro(p.prezzo) + "</button>";
      b.firstChild.addEventListener("click", add);
    });
    watchThumbbar($("#azioni"), true);
  };

  pages.carrello = function () {
    var root = $("#carrello");
    var SHIP = 7, FREE = 120;
    var state = { consegna: "ritiro" };
    function lineHTML(l, i) {
      var p = D.trova(l.id), max = Cart.max(l.id, l.taglia);
      return '<li class="line" data-i="' + i + '"><a class="line__media wind" href="prodotto.html?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + D.img(p.img[0], p.w, "", "120px", true, "") + "</a>" +
        '<div class="line__body"><div class="line__top"><p class="line__name"><a href="prodotto.html?id=' + p.id + '">' + esc(p.nome) + "</a></p>" +
        '<span class="line__price">' + D.euro(p.prezzo * l.qty) + "</span></div>" +
        '<p class="line__meta">' + D.COLORI[p.colore].nome + (max === 1 ? " · ultimo pezzo" + (l.taglia === "Unica" ? "" : " in " + l.taglia) : "") + "</p>" +
        (D.disponibili(p).length > 1 ? '<label class="select line__size"><span class="sr-only">' + (p.tipo === "Scarpe" ? "Numero" : "Taglia") + " di " + esc(p.nome) + '</span><select data-size>' +
          D.disponibili(p).map(function (t) { return '<option value="' + t + '"' + (t === l.taglia ? " selected" : "") + ">" + (p.tipo === "Scarpe" ? "N. " : "Taglia ") + t + "</option>"; }).join("") + "</select></label>"
          : '<p class="line__meta">' + (l.taglia === "Unica" ? "Taglia unica" : "Taglia " + l.taglia) + "</p>") +
        '<div class="line__bottom"><div class="qty" role="group" aria-label="Quantità di ' + esc(p.nome) + '">' +
        '<button type="button" data-q="-1" aria-label="Uno in meno"' + (l.qty <= 1 ? " disabled" : "") + ">−</button><output aria-live=\"polite\">" + l.qty + "</output>" +
        '<button type="button" data-q="1" aria-label="Uno in più"' + (l.qty >= max ? " disabled" : "") + ">+</button></div>" +
        '<button class="line__remove" type="button" data-remove>Togli</button></div></div></li>';
    }
    function totals() {
      var sub = Cart.total(), ship = state.consegna === "spedizione" ? (sub >= FREE ? 0 : SHIP) : 0;
      return { sub: sub, ship: ship, tot: sub + ship };
    }
    function summaryRows() {
      var t = totals();
      return '<div><span>Capi</span><span>' + D.euro(t.sub) + "</span></div>" +
        "<div><span>" + (state.consegna === "spedizione" ? "Spedizione in Sardegna" : "Ritiro in negozio") + "</span><span>" + (t.ship ? D.euro(t.ship) : "Gratis") + "</span></div>" +
        '<div class="summary__total"><span>Totale</span><span>' + D.euro(t.tot) + "</span></div>";
    }
    function render() {
      var lines = Cart.read();
      if (!lines.length) {
        var picks = ["abito-lungo-cala", "camicia-lino-coreana", "foulard-seta-mimosa"].map(D.trova);
        root.innerHTML = '<div class="cart-empty"><h2 class="display">Ancora vuoto.</h2><p class="lead">Il carrello resta salvato su questo telefono: puoi chiudere e tornare quando vuoi.</p>' +
          '<a class="btn" href="collezione.html">Guarda la collezione</a></div>' +
          '<section aria-labelledby="idee"><h2 class="eyebrow" id="idee" style="margin:2.5rem 0 1rem">Da dove cominciare</h2><ul class="grid">' + picks.map(function (p) { return D.card(p, { reveal: false }); }).join("") + "</ul></section>";
        Wind.add(root);
        return;
      }
      var t = totals();
      root.innerHTML =
        '<div><ul class="lines" aria-label="Capi nel carrello">' + lines.map(lineHTML).join("") + "</ul>" +
        '<p class="muted" style="margin-top:1rem;font-size:1rem">Il carrello resta salvato su questo telefono. Prezzi e disponibilità sono di esempio.</p></div>' +
        '<div class="summary"><div class="summary__rows" id="riepilogo">' + summaryRows() + "</div>" +
        '<form class="form" id="ordine" novalidate>' +
          '<fieldset class="field"><legend>Come lo ricevi</legend><div class="options">' +
            '<label class="option"><input type="radio" name="consegna" value="ritiro"' + (state.consegna === "ritiro" ? " checked" : "") + '><span>Ritiro in negozio<small>Gratis. Te lo prepariamo con la taglia giusta e lo provi lì.</small></span></label>' +
            '<label class="option"><input type="radio" name="consegna" value="spedizione"' + (state.consegna === "spedizione" ? " checked" : "") + '><span>Spedizione in Sardegna<small>' + D.euro(SHIP) + ", gratis sopra " + D.euro(FREE) + ". In 2 o 3 giorni lavorativi (esempio).</small></span></label>" +
          "</div></fieldset>" +
          '<div class="field" id="f-nome"><label for="nome">Nome e cognome</label><input type="text" id="nome" name="nome" autocomplete="name" required aria-describedby="e-nome"><p class="error" id="e-nome"></p></div>' +
          '<div class="field" id="f-indirizzo"' + (state.consegna === "spedizione" ? "" : " hidden") + '><label for="indirizzo">Indirizzo di spedizione</label><textarea id="indirizzo" name="indirizzo" autocomplete="street-address" aria-describedby="e-indirizzo"></textarea><small>Via, numero, CAP e paese.</small><p class="error" id="e-indirizzo"></p></div>' +
          '<div class="field"><label for="nota">Una nota per noi <span class="muted">(se vuoi)</span></label><textarea id="nota" name="nota" placeholder="Es. è un regalo, togliete il prezzo"></textarea></div>' +
          '<div class="demo-box"><strong>Pagamento simulato</strong><p>Questa è una dimostrazione: non si inserisce nessuna carta e non si paga nulla. Nel sito vero qui ci sarebbero carta, PayPal o pagamento al ritiro.</p></div>' +
          '<button class="btn btn--accent btn--block" type="submit" id="conferma"><span class="spin" aria-hidden="true"></span><span>Conferma l\'ordine di prova</span></button>' +
        "</form></div>";
      bindForm(); Wind.add(root);
    }
    function refreshSummary() { var r = $("#riepilogo"); if (r) r.innerHTML = summaryRows(); }
    root.addEventListener("click", function (e) {
      var li = e.target.closest(".line"); if (!li) return;
      var i = +li.getAttribute("data-i"), q = e.target.closest("[data-q]");
      if (q) { var l = Cart.read()[i]; Cart.set(i, l.qty + +q.getAttribute("data-q")); keepFocus(i, q.getAttribute("data-q")); return; }
      if (e.target.closest("[data-remove]")) {
        li.classList.add("is-leaving");
        setTimeout(function () {
          var removed = Cart.remove(i), p = D.trova(removed.id);
          toast(esc(p.nome) + " tolto dal carrello.", { label: "Annulla", run: function () { Cart.insert(i, removed); } });
        }, reduce ? 0 : 250);
      }
    });
    root.addEventListener("change", function (e) {
      if (!e.target.matches("[data-size]")) return;
      var i = +e.target.closest(".line").getAttribute("data-i");
      Cart.resize(i, e.target.value);
      var sel = root.querySelector('.line[data-i="' + Math.min(i, Cart.read().length - 1) + '"] [data-size]'); sel && sel.focus();
      toast("Taglia cambiata.");
    });
    function keepFocus(i, dir) {
      var b = root.querySelector('.line[data-i="' + i + '"] [data-q="' + dir + '"]');
      if (b && !b.disabled) b.focus(); else { b = root.querySelector('.line[data-i="' + i + '"] [data-q]:not(:disabled)'); b && b.focus(); }
    }
    function bindForm() {
      var form = $("#ordine"); if (!form) return;
      form.addEventListener("change", function (e) {
        if (e.target.name === "consegna") { state.consegna = e.target.value; $("#f-indirizzo").hidden = state.consegna !== "spedizione"; refreshSummary(); }
      });
      form.addEventListener("input", function (e) { var f = e.target.closest(".field"); if (f && f.classList.contains("is-error") && e.target.value.trim()) { f.classList.remove("is-error"); $(".error", f).textContent = ""; e.target.removeAttribute("aria-invalid"); } });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true, first = null;
        function check(id, msg, cond) {
          var f = $("#f-" + id), inp = $("#" + id), bad = cond(inp.value.trim());
          f.classList.toggle("is-error", bad); $(".error", f).textContent = bad ? msg : "";
          if (bad) { inp.setAttribute("aria-invalid", "true"); ok = false; first = first || inp; } else inp.removeAttribute("aria-invalid");
        }
        check("nome", "Scrivi nome e cognome, così sappiamo per chi è.", function (v) { return v.length < 3 || v.indexOf(" ") < 0; });
        if (state.consegna === "spedizione") check("indirizzo", "Ci serve l'indirizzo completo, con il CAP.", function (v) { return v.length < 10 || !/\d{5}/.test(v); });
        if (!ok) { first.focus(); return; }
        var btn = $("#conferma"); btn.classList.add("is-sending"); btn.setAttribute("aria-disabled", "true");
        $("span:last-child", btn).textContent = "Preparo il riepilogo…";
        setTimeout(function () { done(form); }, reduce ? 0 : 700);
      });
    }
    function done(form) {
      var lines = Cart.read(), t = totals(), code = "PROVA-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      var nome = form.nome.value.trim(), nota = form.nota.value.trim();
      var txt = "[DEMO — ordine di prova da un sito dimostrativo di Mockly. La boutique Maestrale è inventata, nessun pagamento]\n" +
        "Ordine " + code + "\n" + lines.map(function (l) { var p = D.trova(l.id); return "• " + p.nome + " · " + D.COLORI[p.colore].nome + " · " + l.taglia + " × " + l.qty + " = " + D.euro(p.prezzo * l.qty); }).join("\n") +
        "\nConsegna: " + (state.consegna === "spedizione" ? "spedizione a " + form.indirizzo.value.trim().replace(/\s+/g, " ") : "ritiro in negozio") +
        "\nTotale: " + D.euro(t.tot) + "\nNome: " + nome + (nota ? "\nNota: " + nota : "");
      root.innerHTML = '<div class="done" tabindex="-1" id="fatto"><p class="eyebrow">Ordine di prova pronto</p><h2 class="display">Fatto, ' + esc(nome.split(" ")[0]) + ".</h2>" +
        '<p class="done__code">' + code + "</p>" +
        "<p>Nessun pagamento: è una dimostrazione. Nel sito vero ti arriverebbe la conferma e noi prepareremmo i capi. Qui puoi mandare il riepilogo su WhatsApp, per vedere come arriva al negozio.</p>" +
        '<a class="btn btn--accent btn--block" href="' + wa(txt) + '" target="_blank" rel="noopener">Manda su WhatsApp</a>' +
        '<a class="btn btn--ghost btn--block" href="collezione.html">Torna alla collezione</a></div>';
      ordered = true;
      Cart.clear();
      $("#fatto").focus();
    }
    var ordered = false;
    document.addEventListener("cart:change", function () {
      if (ordered) return;
      var form = $("#ordine");
      if (!form || !Cart.read().length) { render(); return; }
      var lines = Cart.read();
      $(".lines", root).innerHTML = lines.map(lineHTML).join("");
      Wind.add(root);
      refreshSummary();
    });
    render();
  };

  updateCount(false);
  if (pages[page]) pages[page]();
  revealAll(document);
  Wind.add(document);
})();
