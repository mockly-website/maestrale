/* Maestrale — dati dei capi (tutti di esempio: prezzi, taglie, disponibilità). */
(function (root) {
  "use strict";

  var COLORI = {
    bianco:  { nome: "Bianco",  hex: "#F1EFEA" },
    sabbia:  { nome: "Sabbia",  hex: "#CDB797" },
    grigio:  { nome: "Grigio",  hex: "#8C8B86" },
    nero:    { nome: "Nero",    hex: "#141414" },
    azzurro: { nome: "Azzurro", hex: "#43BFD9" },
    blu:     { nome: "Blu",     hex: "#2E3C93" },
    salvia:  { nome: "Salvia",  hex: "#B8C2AB" },
    verde:   { nome: "Verde",   hex: "#56704F" },
    giallo:  { nome: "Giallo",  hex: "#F0BE2C" },
    arancio: { nome: "Arancio", hex: "#E5602A" },
    marrone: { nome: "Marrone", hex: "#6A3824" }
  };

  /* Ordine in cui compaiono le taglie nei filtri. */
  var TAGLIE = ["XS", "S", "M", "L", "XL", "37", "38", "39", "40", "Unica"];

  var LAVA_LINO = "Lavaggio a mano o in lavatrice a 30°. Niente asciugatrice. Si stira ancora umido.";
  var LAVA_SETA = "Solo lavaggio a mano in acqua fredda o a secco. Non strizzare.";
  var LAVA_COT = "Lavatrice a 30°, al rovescio. Stiratura a ferro medio.";
  var LAVA_LANA = "Lavaggio a mano in acqua fredda. Asciugare in piano, mai appesa.";

  /* I capi arrivati martedì: hanno anche la foto scontornata (cut) per la stecca in apertura. */
  var NUOVI = [
    {
      id: "abito-lungo-verde", alt: "Abito lungo smanicato verde appeso a una gruccia", nome: "Abito lungo smanicato", tipo: "Abiti", prezzo: 119,
      colore: "verde", img: ["abito-lungo-verde"], w: [400, 800, 1200], cut: "abito-lungo-verde",
      taglie: { XS: 1, S: 2, M: 2, L: 1, XL: 0 },
      materiale: "100% lino lavato", lavaggio: LAVA_LINO,
      vestibilita: "Dritto, lungo fino alla caviglia. Scollo tondo, spalle scoperte.", orlo: true
    },
    {
      id: "abito-maniche-lunghe", alt: "Abito lungo color sabbia chiaro a maniche lunghe, appeso a una gruccia", nome: "Abito lungo a maniche lunghe", tipo: "Abiti", prezzo: 139,
      colore: "sabbia", img: ["abito-maniche-lunghe"], w: [400, 800, 1200], cut: "abito-maniche-lunghe",
      taglie: { XS: 0, S: 1, M: 2, L: 1, XL: 0 },
      materiale: "100% viscosa, maniche in tulle leggero", lavaggio: LAVA_SETA,
      vestibilita: "Aderente sopra, gonna ampia che arriva alla caviglia.", orlo: true
    },
    {
      id: "abito-midi-panna", alt: "Abito lungo in cotone color panna appeso a una gruccia di legno", nome: "Abito t-shirt in cotone", tipo: "Abiti", prezzo: 79,
      colore: "bianco", img: ["abito-midi-panna"], w: [400, 800, 1200], cut: "abito-midi-panna",
      taglie: { XS: 1, S: 2, M: 2, L: 2, XL: 1 },
      materiale: "100% cotone pesante", lavaggio: LAVA_COT,
      vestibilita: "Morbido, sotto il ginocchio. Si porta anche con una cintura."
    },
    {
      id: "camicia-lino-corta", alt: "Camicia bianca in lino a maniche corte con collo coreano, appesa a una gruccia di legno", nome: "Camicia in lino a maniche corte", tipo: "Camicie", prezzo: 69,
      colore: "bianco", img: ["camicia-lino-corta"], w: [400, 800, 1200], cut: "camicia-lino-corta",
      taglie: { XS: 1, S: 2, M: 3, L: 2, XL: 1 },
      materiale: "100% lino lavato", lavaggio: LAVA_LINO,
      vestibilita: "Comoda, da portare fuori dai pantaloni."
    },
    {
      id: "blazer-morbido", alt: "Blazer color sabbia appeso a una gruccia di legno", nome: "Blazer morbido", tipo: "Giacche", prezzo: 159,
      colore: "sabbia", img: ["blazer-morbido"], w: [400, 800, 1200], cut: "blazer-morbido",
      taglie: { XS: 0, S: 1, M: 2, L: 1, XL: 1 },
      materiale: "60% lana, 40% viscosa. Senza fodera.", lavaggio: "Lavaggio a secco.",
      vestibilita: "Spalla scesa, un po' lungo. Si porta aperto."
    },
    {
      id: "blazer-nero", alt: "Blazer nero sopra una camicia bianca, appesi alla stessa gruccia", nome: "Blazer nero sciancrato", tipo: "Giacche", prezzo: 179,
      colore: "nero", img: ["blazer-nero"], w: [400, 800, 1200], cut: "blazer-nero",
      taglie: { XS: 1, S: 1, M: 1, L: 0, XL: 0 },
      materiale: "98% lana, 2% elastan. Fodera in viscosa.", lavaggio: "Lavaggio a secco.",
      vestibilita: "Stretto in vita, un bottone. Veste regolare."
    },
    {
      id: "giacca-sahariana", alt: "Giacca sahariana color cammello con cintura, appesa a una gruccia nera", nome: "Giacca sahariana con cintura", tipo: "Giacche", prezzo: 175,
      colore: "sabbia", img: ["trench-corto"], w: [400, 800, 1200], cut: "trench-corto",
      taglie: { XS: 1, S: 2, M: 1, L: 1, XL: 0 },
      materiale: "100% cotone gabardine", lavaggio: LAVA_COT,
      vestibilita: "Morbida, si chiude con la cintura. Arriva a metà coscia."
    },
    {
      id: "gilet-quadri", alt: "Gilet doppiopetto grigio a quadri appeso a una gruccia di legno", nome: "Gilet a quadri doppiopetto", tipo: "Giacche", prezzo: 89,
      colore: "grigio", img: ["gilet-quadri"], w: [400, 800, 1200], cut: "gilet-quadri",
      taglie: { XS: 1, S: 1, M: 2, L: 1, XL: 0 },
      materiale: "70% lana, 30% poliestere", lavaggio: "Lavaggio a secco.",
      vestibilita: "Corto, sopra una camicia o da solo."
    },
    {
      id: "gilet-traforato", alt: "Gilet blu in maglia traforata sopra un top bianco, appesi a una gruccia di legno", nome: "Gilet in maglia traforata", tipo: "Maglie", prezzo: 65,
      colore: "blu", img: ["gilet-traforato"], w: [400, 800, 1200], cut: "gilet-traforato",
      taglie: { XS: 0, S: 1, M: 2, L: 2, XL: 1 },
      materiale: "100% cotone", lavaggio: LAVA_LANA,
      vestibilita: "Lungo e aperto davanti. Il top bianco non è compreso."
    },
    {
      id: "polo-righe", alt: "Polo in maglia marrone a righe chiare appesa a una gruccia di legno", nome: "Polo in maglia a righe", tipo: "Maglie", prezzo: 72,
      colore: "marrone", img: ["polo-righe"], w: [400, 800, 1200], cut: "polo-righe",
      taglie: { XS: 1, S: 2, M: 1, L: 0, XL: 0 },
      materiale: "80% cotone, 20% lana", lavaggio: LAVA_LANA,
      vestibilita: "Corta, maniche fino al gomito."
    },
    {
      id: "tshirt-stampa", alt: "Maglietta azzurra con stampa gialla appesa a una gruccia", nome: "Maglietta con stampa", tipo: "Maglie", prezzo: 39,
      colore: "azzurro", img: ["tshirt-stampa"], w: [400, 800, 1200], cut: "tshirt-stampa",
      taglie: { XS: 2, S: 3, M: 3, L: 2, XL: 1 },
      materiale: "100% cotone tinto in capo", lavaggio: LAVA_COT,
      vestibilita: "Ampia, spalla scesa."
    }
  ];

  var CAPI = [
    {
      id: "abito-lungo-cala", alt: "Donna di spalle in riva al mare con l'abito lungo azzurro mosso dal vento", nome: "Abito lungo Cala", tipo: "Abiti", prezzo: 129,
      colore: "azzurro", img: ["abito-lungo"], w: [400, 800, 1200],
      taglie: { XS: 1, S: 2, M: 1, L: 0, XL: 0 },
      materiale: "100% viscosa", lavaggio: "Lavaggio a mano a 30°. Si asciuga in fretta, appeso all'ombra.",
      vestibilita: "Morbido, lungo fino alla caviglia. Spalline regolabili.",
      orlo: true, nuovo: true,
      nota: "Il tessuto è leggero: col vento si muove così, come in foto."
    },
    {
      id: "abito-schiena-incrociata", alt: "Abito bianco con la schiena incrociata, indossato in riva al mare, visto di spalle", nome: "Abito schiena incrociata", tipo: "Abiti", prezzo: 98,
      colore: "bianco", img: ["abito-bianco"], w: [400, 800, 1200],
      taglie: { XS: 0, S: 1, M: 3, L: 2, XL: 1 },
      materiale: "100% cotone", lavaggio: LAVA_COT,
      vestibilita: "Aderente in vita, gonna ampia. Schiena scoperta con incrocio.",
      orlo: true, nuovo: true
    },
    {
      id: "abito-plisse-spuma", alt: "Dettaglio dell'abito plissé grigio azzurro con volant, indossato", nome: "Abito plissé Spuma", tipo: "Abiti", prezzo: 145,
      colore: "azzurro", img: ["abito-plisse"], w: [400, 800, 1200],
      taglie: { XS: 0, S: 1, M: 1, L: 0, XL: 0 },
      materiale: "100% poliestere riciclato", lavaggio: "Lavaggio a mano a freddo. La piega non si stira: resta da sola.",
      vestibilita: "Dritto, con volant sul davanti. Veste regolare.",
      nuovo: true
    },
    {
      id: "camicia-lino-coreana", alt: "Camicia in lino color naturale con collo coreano, appesa a una gruccia di legno", nome: "Camicia in lino collo coreano", tipo: "Camicie", prezzo: 79,
      colore: "bianco", img: ["camicia-lino", "camicia-lino-2"], w: [400, 800, 1200],
      taglie: { XS: 2, S: 3, M: 2, L: 1, XL: 1 },
      materiale: "100% lino lavato", lavaggio: LAVA_LINO,
      vestibilita: "Comoda sulle spalle. Se sei tra due taglie, prendi la più piccola.",
      nuovo: true, cut: "camicia-lino-coreana"
    },
    {
      id: "blazer-destrutturato", alt: "Blazer color sabbia appeso a un appendiabiti nero su parete chiara", nome: "Blazer destrutturato", tipo: "Giacche", prezzo: 169,
      colore: "sabbia", img: ["blazer"], w: [400, 720],
      taglie: { XS: 0, S: 1, M: 2, L: 1, XL: 0 },
      materiale: "55% lino, 45% cotone. Senza fodera.", lavaggio: "Lavaggio a secco consigliato.",
      vestibilita: "Spalla morbida, senza imbottitura. Si porta aperto."
    },
    {
      id: "camicia-giacca-cotone", alt: "Camicia giacca color cammello appesa accanto a una camicia chiara", nome: "Camicia giacca in cotone", tipo: "Camicie", prezzo: 89,
      colore: "sabbia", img: ["overshirt"], w: [400, 800, 1200],
      taglie: { XS: 1, S: 2, M: 2, L: 2, XL: 1 },
      materiale: "100% cotone pesante", lavaggio: LAVA_COT,
      vestibilita: "Ampia, da portare sopra una maglia. Due tasche al petto."
    },
    {
      id: "maglia-righe-cotone", alt: "Maglia a maglia grossa con righe blu e grigie, piegata su fondo bianco", nome: "Maglia a righe in cotone", tipo: "Maglie", prezzo: 69,
      colore: "blu", img: ["maglia-righe"], w: [400, 800],
      taglie: { XS: 1, S: 2, M: 2, L: 1, XL: 0 },
      materiale: "100% cotone a maglia grossa", lavaggio: LAVA_LANA,
      vestibilita: "Corta in vita, girocollo. Buona per le sere di vento."
    },
    {
      id: "chemisier-cintura", alt: "Abito chemisier blu con cintura su un manichino, davanti a un muro rosa", nome: "Chemisier con cintura", tipo: "Abiti", prezzo: 115,
      colore: "blu", img: ["chemisier"], w: [400, 800],
      taglie: { XS: 0, S: 1, M: 2, L: 2, XL: 1 },
      materiale: "100% cotone popeline", lavaggio: LAVA_COT,
      vestibilita: "Al ginocchio, cintura in tessuto. Maniche con laccetto.",
      orlo: true
    },
    {
      id: "foulard-seta-grafico", alt: "Foulard in seta con stampa grafica arancio, blu e nera, annodato", nome: "Foulard in seta, stampa grafica", tipo: "Accessori", prezzo: 49,
      colore: "arancio", img: ["foulard"], w: [400, 800, 1200],
      taglie: { Unica: 3 },
      materiale: "100% seta, orli arrotolati a mano", lavaggio: LAVA_SETA,
      vestibilita: "90 × 90 cm. Al collo, in testa o legato alla borsa."
    },
    {
      id: "foulard-seta-mimosa", alt: "Foulard in seta giallo annodato su una camicia bianca", nome: "Foulard in seta Mimosa", tipo: "Accessori", prezzo: 45,
      colore: "giallo", img: ["foulard-giallo"], w: [400, 800, 1200],
      taglie: { Unica: 1 },
      materiale: "100% seta", lavaggio: LAVA_SETA,
      vestibilita: "70 × 70 cm. Piccolo, sta anche in tasca.",
      nuovo: true
    },
    {
      id: "pantalone-palazzo-foglie", alt: "Pantalone palazzo giallo con stampa di foglie, indossato, inquadrato dalla vita in giù", nome: "Pantalone palazzo a foglie", tipo: "Pantaloni", prezzo: 85,
      colore: "giallo", img: ["palazzo"], w: [400, 800, 1200],
      taglie: { XS: 1, S: 1, M: 0, L: 2, XL: 1 },
      materiale: "100% viscosa", lavaggio: "Lavaggio a mano a 30°. Non in asciugatrice.",
      vestibilita: "Vita alta con elastico dietro, gamba ampia.",
      orlo: true
    },
    {
      id: "trench-gabardine", alt: "Trench color sabbia indossato, visto di spalle fra rami in fiore", nome: "Trench in gabardine", tipo: "Giacche", prezzo: 189,
      colore: "sabbia", img: ["trench"], w: [400, 800, 1200],
      taglie: { XS: 1, S: 1, M: 2, L: 1, XL: 0 },
      materiale: "100% cotone gabardine, trattamento antigoccia", lavaggio: "Lavaggio a secco.",
      vestibilita: "Lungo sotto il ginocchio, cintura e alamari ai polsi.",
      orlo: true
    },
    {
      id: "giacca-trapuntata", alt: "Giacca trapuntata color salvia appoggiata sulle spalle, vista di spalle", nome: "Giacca trapuntata", tipo: "Giacche", prezzo: 135,
      colore: "salvia", img: ["trapuntata"], w: [400, 800, 1200],
      taglie: { XS: 0, S: 2, M: 1, L: 1, XL: 1 },
      materiale: "Esterno 100% nylon riciclato, imbottitura leggera", lavaggio: "Lavatrice a 30°, programma delicati.",
      vestibilita: "Ampia, spalla scesa. Si porta anche sulle spalle, senza infilarla."
    },
    {
      id: "pantalone-gessato", alt: "Pantalone nero gessato a vita alta con una mano in tasca", nome: "Pantalone gessato", tipo: "Pantaloni", prezzo: 89,
      colore: "nero", img: ["pantalone-righe"], w: [400, 800],
      taglie: { XS: 1, S: 2, M: 2, L: 1, XL: 1 },
      materiale: "70% viscosa, 30% lino", lavaggio: LAVA_LINO,
      vestibilita: "Vita alta, gamba dritta. Tasche a filetto.",
      orlo: true
    },
    {
      id: "camicia-righe-sottili", alt: "Mani che abbottonano una camicia a righe sottili", nome: "Camicia a righe sottili", tipo: "Camicie", prezzo: 75,
      colore: "grigio", img: ["camicia-righe"], w: [400, 800],
      taglie: { XS: 1, S: 1, M: 1, L: 1, XL: 0 },
      materiale: "100% cotone", lavaggio: LAVA_COT,
      vestibilita: "Regolare, si porta anche dentro i pantaloni."
    },
    {
      id: "maglione-trecce", alt: "Pila di maglioni a trecce piegati, dal bianco al nocciola", nome: "Maglione a trecce", tipo: "Maglie", prezzo: 99,
      colore: "bianco", img: ["maglione", "maglione-2"], w: [400, 800, 1200],
      taglie: { XS: 0, S: 1, M: 2, L: 1, XL: 0 },
      materiale: "60% lana, 40% cotone", lavaggio: LAVA_LANA,
      vestibilita: "Morbido e un po' lungo. Non pizzica."
    },
    {
      id: "borsa-cocco", alt: "Borsa a mano marrone stampa cocco portata a tracolla su un trench", nome: "Borsa a mano stampa cocco", tipo: "Accessori", prezzo: 119,
      colore: "marrone", img: ["borsa"], w: [400],
      taglie: { Unica: 2 },
      materiale: "Pelle stampata, tracolla regolabile e staccabile", lavaggio: "Pulire con un panno asciutto.",
      vestibilita: "24 × 17 cm. Ci stanno telefono, chiavi e portafoglio."
    },
    {
      id: "mocassini-pelle", alt: "Mocassini neri in pelle mentre si cammina", nome: "Mocassini in pelle", tipo: "Scarpe", prezzo: 110,
      colore: "nero", img: ["mocassini"], w: [400],
      taglie: { "37": 1, "38": 2, "39": 1, "40": 0 },
      materiale: "Pelle liscia, suola in gomma", lavaggio: "Crema neutra per pelle, una volta al mese.",
      vestibilita: "Calzata regolare. Se hai il piede largo, prendi mezzo numero in più."
    }
  ];


  CAPI.forEach(function (p) { if (p.id !== "camicia-lino-coreana") delete p.nuovo; });
  NUOVI.forEach(function (p) { p.nuovo = true; });
  CAPI = NUOVI.concat(CAPI);

  /* Seconde foto (stesso ordine di img) */
  var ALT2 = {
    "camicia-lino-coreana": "La stessa camicia in lino appesa a un ramo, intera",
    "maglione-trecce": "Dettaglio della trama a trecce del maglione"
  };

  /* Il look della settimana: punti sulla foto in percentuale. */
  var LOOK = [
    { id: "trench-gabardine", x: 50, y: 33, nome: "Trench" },
    { id: "borsa-cocco", x: 57, y: 46, nome: "Borsa" },
    { id: "mocassini-pelle", x: 46, y: 87, nome: "Mocassini" }
  ];

  function euro(n) { return n.toLocaleString("it-IT") + "\u00a0€"; }
  function trova(id) { for (var i = 0; i < CAPI.length; i++) if (CAPI[i].id === id) return CAPI[i]; return null; }
  function disponibili(p) { return Object.keys(p.taglie).filter(function (t) { return p.taglie[t] > 0; }); }
  function preferita(p) {
    var o = ["M", "S", "L", "38", "39", "XS", "XL", "37", "40", "Unica"];
    for (var i = 0; i < o.length; i++) if (p.taglie[o[i]] > 0) return o[i];
    return null;
  }
  function pezzi(p) { return Object.keys(p.taglie).reduce(function (a, t) { return a + p.taglie[t]; }, 0); }
  function srcset(name, w) { return w.map(function (x) { return "assets/img/" + name + "-" + x + ".webp " + x + "w"; }).join(", "); }
  function img(name, w, alt, sizes, lazy, cls) {
    var big = w[w.length - 1], mid = w[Math.min(1, w.length - 1)];
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="assets/img/' + name + '-' + mid + '.webp" srcset="' + srcset(name, w) +
      '" sizes="' + sizes + '" width="' + big + '" height="' + Math.round(big * 1.25) + '" alt="' + alt.replace(/"/g, "&quot;") + '"' +
      (lazy === false ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
  }
  var SIZES = "(min-width: 90em) 20vw, (min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw";
  var SIZES_BIG = "(min-width: 90em) 40vw, (min-width: 64em) 50vw, (min-width: 48em) 66vw, 100vw";

  /* Scheda capo usata da tutte le pagine (anche dal generatore statico). */
  function card(p, o) {
    o = o || {};
    var tutte = Object.keys(p.taglie), libere = disponibili(p), n = pezzi(p);
    var badge = n === 1 ? '<span class="card__badge card__badge--last">Ultimo pezzo</span>'
      : (p.nuovo ? '<span class="card__badge">Arrivato martedì</span>' : "");
    var sizes = o.big ? SIZES_BIG : SIZES;
    var media = img(p.img[0], p.w, p.alt, sizes, o.lazy) + (p.img[1] ? img(p.img[1], p.w, "", sizes, true, "alt") : "");
    var vis = tutte.map(function (t) { return p.taglie[t] > 0 ? t : "<s>" + t + "</s>"; }).join(" ");
    var H = o.h || "h3";
    return '<li class="card' + (o.big ? " card--big" : "") + (o.reveal === false ? "" : " reveal") + '" data-id="' + p.id + '" data-colore="' + p.colore +
      '" data-taglie="' + libere.join(" ") + '" data-prezzo="' + p.prezzo + '" data-nuovo="' + (p.nuovo ? 1 : 0) + '">' +
      '<a class="card__link" href="prodotto.html?id=' + p.id + '">' +
      '<div class="card__media wind">' + media + badge + '</div>' +
      '<div class="card__info"><' + H + ' class="card__name">' + p.nome + '</' + H + '><span class="card__price">' + euro(p.prezzo) + '</span>' +
      '<p class="card__sizes"><span class="sr-only">Colore ' + COLORI[p.colore].nome.toLowerCase() + '. Taglie disponibili: ' + libere.join(", ") + '</span>' +
      '<span aria-hidden="true">' + vis + '</span></p></div></a></li>';
  }

  var data = { COLORI: COLORI, TAGLIE: TAGLIE, CAPI: CAPI, LOOK: LOOK, ALT2: ALT2,
    euro: euro, trova: trova, disponibili: disponibili, preferita: preferita, pezzi: pezzi, img: img, card: card, SIZES: SIZES, SIZES_BIG: SIZES_BIG };
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  else root.MAESTRALE = data;
})(this);
