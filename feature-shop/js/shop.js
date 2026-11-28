/* =========================================================
   The Proto Shop: listing (shop.html) and product page (product.html)
   Products are managed in the MakeMeProto Ops app and loaded live.
   Ordering: the order is saved (so it shows up in the app and on Track order),
   then WhatsApp opens with everything filled in. No cart, no online payment.
   Uses helpers from main.js: $, $$, T, inr, escHtml, waLink, waFormat, postEntry, toast, phoneOk, CONFIG, LANG.
   ========================================================= */
(() => {
  const KEY = "mmp-shop";
  const PAGE = document.body.dataset.page;
  if (PAGE !== "shop" && PAGE !== "product") return;

  const CAT_ICON = { "Home decor": "🏠", Lamps: "💡", Gifts: "🎁", "Desk & office": "🖊️", Keychains: "🔑", Planters: "🪴", "Toys & games": "🧩", "Tools & parts": "🔧" };
  const icon = (cat) => CAT_ICON[cat] || "✨";
  const esc = (v) => escHtml(v);
  const priceOf = (p) => p.price;
  const off = (p) => (p.was > p.price ? Math.round((1 - p.price / p.was) * 100) : 0);
  const productUrl = (p) => `product.html?id=${encodeURIComponent(p.id)}&n=${encodeURIComponent(p.slug || "")}${/[?&]sample=1\b/.test(location.search) ? "&sample=1" : ""}`;
  const colourKey = (c) => String(c.name || "").trim().toLowerCase();

  /* ---------- data: last known list at once, then the latest ---------- */
  let products = null, categories = [];
  // test sites only: ?sample=1 shows sample products so the design can be checked before real ones exist
  const SAMPLE = /\.github\.io$|^localhost$|^127\./.test(location.hostname) && /[?&]sample=1\b/.test(location.search);
  const request = SAMPLE
    ? new Promise((res) => { const s = document.createElement("script"); s.src = "js/shop-sample.js"; s.onload = () => res(window.MMP_SHOP_SAMPLE); s.onerror = () => res(null); document.head.appendChild(s); })
    : (CONFIG.forms && CONFIG.forms.endpoint)
    ? fetch(CONFIG.forms.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ form: "products" }) })
      .then((r) => r.json()).catch(() => null)
    : Promise.resolve(null);

  function load(onData) {
    let cached = null;
    try { if (!SAMPLE) cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { /* no storage */ }
    if (cached && Array.isArray(cached.d && cached.d.products)) { products = cached.d.products; categories = cached.d.categories || []; onData(false); }
    request.then((d) => {
      if (!d || !d.ok || !Array.isArray(d.products)) { if (!products) { products = []; onData(true, true); } return; }
      const same = JSON.stringify(d.products) === JSON.stringify(products);
      products = d.products; categories = d.categories || [];
      try { if (!SAMPLE) localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* no storage */ }
      if (!same || !cached) onData(true);
    });
  }

  /* ---------- shared bits ---------- */
  function media(p, cls, big) {
    const list = big ? p.images : p.thumbs;
    if (!list || !list.length) return `<span class="${cls} pmedia--none"><span class="pmedia__emoji" aria-hidden="true">${icon(p.category)}</span></span>`;
    const second = !big && list[1] ? `<img class="pmedia__alt" src="${esc(list[1])}" alt="" loading="lazy" decoding="async">` : "";
    return `<span class="${cls}"><img src="${esc(list[0])}" alt="${esc(p.title)}" loading="lazy" decoding="async">${second}</span>`;
  }
  function dot(c) {
    return `<i class="cdot" style="--c:${esc(c.hex || "#8E8E8E")}" title="${esc(c.name)}"></i>`;
  }
  function card(p) {
    const pct = off(p), cols = p.colours || [], from = (p.options || []).some((o) => o.add > 0);
    const meta = p.orders > 0 ? `🔥 ${p.orders} ${T("logon ne liya", p.orders === 1 ? "order" : "orders")}` : p.ships ? `🚚 ${esc(p.ships)}` : `🖨️ ${T("Fresh print", "Printed fresh")}`;
    return `<a class="pcard" href="${productUrl(p)}" data-id="${esc(p.id)}">
      <span class="pcard__top">
        ${media(p, "pcard__media pmedia")}
        ${p.featured ? `<span class="pcard__sticker hand">${T("Sabka favourite ⭐", "Crowd favourite ⭐")}</span>` : ""}
        ${pct ? `<span class="pbadge pbadge--sale">−${pct}%</span>` : ""}
        ${p.personalise ? `<span class="pcard__custom">✏️ ${T("naam likhwao", "add a name")}</span>` : ""}
      </span>
      <span class="pcard__body">
        <span class="pcard__cat mono">${esc(p.category)}</span>
        <span class="pcard__title">${esc(p.title)}</span>
        <span class="pcard__row">
          <span class="pcard__price">${from && LANG === "en" ? `<small>from</small>` : ""}${inr(p.price)}${from && LANG !== "en" ? `<small>se shuru</small>` : ""}${p.was > p.price ? `<s>${inr(p.was)}</s>` : ""}</span>
          <span class="pcard__dots">${cols.slice(0, 3).map(dot).join("")}${cols.length > 3 ? `<b>+${cols.length - 3}</b>` : ""}</span>
        </span>
        <span class="pcard__meta">${meta}</span>
      </span>
    </a>`;
  }
  // the last tile: for anything not in the shop
  const customTile = () => `<a class="pcard pcard--custom" href="pricing.html#quote">
      <span class="pcard__customin">
        <span class="pcard__emoji" aria-hidden="true">💭</span>
        <span class="pcard__title hand">${T("Jo chahiye woh nahi mila?", "Can't find what you need?")}</span>
        <span class="pcard__ask">${T("Idea bhejo, hum design karke print kar denge.", "Send us your idea and we'll design and print it.")}</span>
        <span class="btn btn--accent btn--sm">⚡ ${T("Custom price lo", "Get a custom price")}</span>
      </span>
    </a>`;
  const skeletons = (n) => Array.from({ length: n }, () => `<span class="pcard pcard--skel" aria-hidden="true"><span class="pcard__top"><span class="pcard__media skel"></span></span><span class="pcard__body"><span class="skel skel--line" style="width:40%"></span><span class="skel skel--line"></span><span class="skel skel--line" style="width:55%"></span></span></span>`).join("");

  /* =========================================================
     Listing
     ========================================================= */
  function initListing() {
    const grid = $("#shopGrid"), cats = $("#shopCats"), search = $("#shopSearch"), sort = $("#shopSort");
    const panel = $("#shopFilters"), fBtn = $("#shopFiltersBtn");
    const S = { q: "", cat: "all", mats: new Set(), cols: new Set(), min: "", max: "", sale: false, custom: false, sort: "featured" };
    const PRESETS = [{ k: "u300", lbl: () => T("₹300 tak", "Under ₹300"), min: "", max: 300 }, { k: "300-700", lbl: () => "₹300 – ₹700", min: 300, max: 700 }, { k: "700", lbl: () => "₹700+", min: 700, max: "" }];

    // state ↔ address bar, so a filtered list can be shared
    function readUrl() {
      const u = new URLSearchParams(location.search);
      S.q = u.get("q") || ""; S.cat = u.get("cat") || "all"; S.sort = u.get("sort") || "featured";
      S.mats = new Set((u.get("mat") || "").split(",").filter(Boolean)); S.cols = new Set((u.get("col") || "").split(",").filter(Boolean));
      S.min = u.get("min") || ""; S.max = u.get("max") || ""; S.sale = u.get("sale") === "1"; S.custom = u.get("custom") === "1";
    }
    function writeUrl() {
      const u = new URLSearchParams();
      if (SAMPLE) u.set("sample", "1");
      if (S.q) u.set("q", S.q); if (S.cat !== "all") u.set("cat", S.cat); if (S.sort !== "featured") u.set("sort", S.sort);
      if (S.mats.size) u.set("mat", [...S.mats].join(",")); if (S.cols.size) u.set("col", [...S.cols].join(","));
      if (S.min) u.set("min", S.min); if (S.max) u.set("max", S.max); if (S.sale) u.set("sale", "1"); if (S.custom) u.set("custom", "1");
      history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash);
    }

    const words = (p) => [p.title, p.category, p.description, ...(p.tags || []), ...(p.materials || []), ...(p.colours || []).map((c) => c.name)].join(" ").toLowerCase();
    function matches(p, skipCat) {
      if (!skipCat && S.cat !== "all" && p.category !== S.cat) return false;
      if (S.q && !S.q.toLowerCase().split(/\s+/).every((w) => words(p).includes(w))) return false;
      if (S.mats.size && !(p.materials || []).some((m) => S.mats.has(m))) return false;
      if (S.cols.size && !(p.colours || []).some((c) => S.cols.has(colourKey(c)))) return false;
      if (S.min !== "" && priceOf(p) < Number(S.min)) return false;
      if (S.max !== "" && priceOf(p) > Number(S.max)) return false;
      if (S.sale && !off(p)) return false;
      if (S.custom && !p.personalise) return false;
      return true;
    }
    const sorters = {
      featured: () => 0,   // the server already sends them in the order set in the app
      popular: (a, b) => (b.orders || 0) - (a.orders || 0),
      new: (a, b) => String(b.added || "").localeCompare(String(a.added || "")) || String(b.id).localeCompare(String(a.id)),
      low: (a, b) => priceOf(a) - priceOf(b),
      high: (a, b) => priceOf(b) - priceOf(a),
    };
    const filterCount = () => S.mats.size + S.cols.size + (S.min !== "" || S.max !== "" ? 1 : 0) + (S.sale ? 1 : 0) + (S.custom ? 1 : 0);

    function buildFilters() {
      const all = products || [];
      // categories that have products, in the app's order, then any others
      const used = [...new Set(all.map((p) => p.category))];
      const order = [...categories.filter((c) => used.includes(c)), ...used.filter((c) => !categories.includes(c))];
      cats.innerHTML = [["all", `🛍️ ${T("Sab kuch", "Everything")}`], ...order.map((c) => [c, `${icon(c)} ${esc(c)}`])]
        .map(([k, lbl]) => `<button type="button" class="mfilter__btn${S.cat === k ? " is-on" : ""}" data-cat="${esc(k)}" aria-pressed="${S.cat === k}">${lbl} <b>${k === "all" ? all.length : all.filter((p) => p.category === k).length}</b></button>`).join("");
      const mats = [...new Set(all.flatMap((p) => p.materials || []))];
      $("#fMaterial").hidden = !mats.length;
      $("#fMaterial .sfilters__chips").innerHTML = mats.map((m) => `<button type="button" class="schip${S.mats.has(m) ? " is-on" : ""}" data-mat="${esc(m)}" aria-pressed="${S.mats.has(m)}">${esc(m)}</button>`).join("");
      const colours = new Map();
      all.forEach((p) => (p.colours || []).forEach((c) => { const k = colourKey(c); if (k && !colours.has(k)) colours.set(k, c); }));
      $("#fColour").hidden = !colours.size;
      $("#fColour .sfilters__swatches").innerHTML = [...colours].map(([k, c]) => `<button type="button" class="sswatch${S.cols.has(k) ? " is-on" : ""}" data-col="${esc(k)}" aria-pressed="${S.cols.has(k)}" title="${esc(c.name)}"><i class="cdot" style="--c:${esc(c.hex || "#8E8E8E")}"></i><span class="sr-only">${esc(c.name)}</span></button>`).join("");
      $("#fColourPicked").textContent = S.cols.size ? [...S.cols].map((k) => colours.get(k)?.name || k).join(", ") : T("Rang pe tap karo", "Tap a colour");
      $("#fPricePresets").innerHTML = PRESETS.map((x) => { const on = String(S.min) === String(x.min) && String(S.max) === String(x.max); return `<button type="button" class="schip${on ? " is-on" : ""}" data-preset="${x.k}" aria-pressed="${on}">${x.lbl()}</button>`; }).join("");
      $("#fMin").value = S.min; $("#fMax").value = S.max; $("#fSale").checked = S.sale; $("#fCustom").checked = S.custom;
      search.value = S.q; sort.value = S.sort;
      const n = filterCount(), badge = $("#shopFilterCount");
      badge.hidden = !n; badge.textContent = n;
    }

    function activeChips() {
      const chips = [];
      if (S.q) chips.push([`“${esc(S.q)}”`, () => { S.q = ""; }]);
      S.mats.forEach((m) => chips.push([esc(m), () => S.mats.delete(m)]));
      S.cols.forEach((k) => chips.push([esc(k[0].toUpperCase() + k.slice(1)), () => S.cols.delete(k)]));
      if (S.min !== "" || S.max !== "") chips.push([`${S.min !== "" ? inr(S.min) : "₹0"} – ${S.max !== "" ? inr(S.max) : "∞"}`, () => { S.min = ""; S.max = ""; }]);
      if (S.sale) chips.push([T("Sale", "On sale"), () => { S.sale = false; }]);
      if (S.custom) chips.push([T("Personalise", "Personalised"), () => { S.custom = false; }]);
      $("#shopActive").innerHTML = chips.map(([l], i) => `<button type="button" class="achip" data-i="${i}">${l} <span aria-hidden="true">✕</span><span class="sr-only">${T("hatao", "remove")}</span></button>`).join("");
      $$("#shopActive .achip").forEach((b) => b.addEventListener("click", () => { chips[+b.dataset.i][1](); update(); }));
    }

    function render() {
      grid.setAttribute("aria-busy", "false");
      const list = (products || []).filter((p) => matches(p)).slice().sort(sorters[S.sort] || sorters.featured);
      $("#shopCount").innerHTML = products ? `<b>${list.length}</b> ${LANG === "en" ? (list.length === 1 ? "design" : "designs") : (list.length === 1 ? "design mila" : "designs mile")}` : "";
      if (!products) { grid.innerHTML = skeletons(8); return; }
      if (!products.length) {
        grid.innerHTML = `<div class="pgrid__empty"><p class="pgrid__emoji" aria-hidden="true">🖨️</p><h3>${T("Shop jaldi khulegi!", "The shop opens soon!")}</h3><p>${T("Hum pehle designs print kar rahe hain. Tab tak apna idea bhejo.", "We're printing the first designs. Meanwhile, send us your own idea.")}</p><a href="pricing.html#quote" class="btn btn--accent">⚡ ${T("Custom print price", "Custom print price")}</a></div>`;
        return;
      }
      grid.innerHTML = list.length ? list.map(card).join("") + customTile()
        : `<div class="pgrid__empty"><p class="pgrid__emoji" aria-hidden="true">🔍</p><h3>${T("Kuch nahi mila", "Nothing matches")}</h3><p>${T("Filters kam karke dekho, ya humein bata do kya chahiye.", "Try fewer filters, or tell us what you're looking for.")}</p><button type="button" class="btn btn--ghost" data-clear>${T("Filters hatao", "Clear filters")}</button></div>`;
      $("[data-clear]", grid)?.addEventListener("click", clearAll);
      activeChips();
    }
    function update() { writeUrl(); buildFilters(); render(); }
    function clearAll() { Object.assign(S, { q: "", mats: new Set(), cols: new Set(), min: "", max: "", sale: false, custom: false }); update(); }

    // events (delegated: the buttons are rebuilt on every change)
    cats.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) { S.cat = b.dataset.cat; update(); } });
    panel.addEventListener("click", (e) => {
      const m = e.target.closest("[data-mat]"), c = e.target.closest("[data-col]"), pr = e.target.closest("[data-preset]");
      if (m) { S.mats.has(m.dataset.mat) ? S.mats.delete(m.dataset.mat) : S.mats.add(m.dataset.mat); update(); }
      if (c) { S.cols.has(c.dataset.col) ? S.cols.delete(c.dataset.col) : S.cols.add(c.dataset.col); update(); }
      if (pr) { const x = PRESETS.find((y) => y.k === pr.dataset.preset), on = String(S.min) === String(x.min) && String(S.max) === String(x.max); S.min = on ? "" : x.min; S.max = on ? "" : x.max; update(); }
    });
    let qt;
    search.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(() => { S.q = search.value.trim(); writeUrl(); render(); }, 180); });
    sort.addEventListener("change", () => { S.sort = sort.value; update(); });
    const num = (el, k) => el.addEventListener("change", () => { S[k] = el.value === "" ? "" : String(Math.max(0, Math.round(+el.value))); update(); });
    num($("#fMin"), "min"); num($("#fMax"), "max");
    $("#fSale").addEventListener("change", (e) => { S.sale = e.target.checked; update(); });
    $("#fCustom").addEventListener("change", (e) => { S.custom = e.target.checked; update(); });
    $("#shopClear").addEventListener("click", clearAll);

    // phones: filters open as a sheet from the bottom
    const open = (on) => { panel.classList.toggle("is-open", on); fBtn.setAttribute("aria-expanded", on); document.body.classList.toggle("sheet-open", on); };
    fBtn.addEventListener("click", () => open(true));
    $("#shopFiltersClose").addEventListener("click", () => open(false));
    $("#shopFiltersDone").addEventListener("click", () => { open(false); grid.scrollIntoView({ behavior: "smooth", block: "start" }); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("is-open")) open(false); });

    addEventListener("mmp:lang", () => { buildFilters(); render(); });
    readUrl(); buildFilters(); render();
    load(() => { buildFilters(); render(); });
  }

  /* =========================================================
     Product page
     ========================================================= */
  function initProduct() {
    const box = $("#pdp"), params = new URLSearchParams(location.search), id = params.get("id") || "";
    $$('#navLinks a[href="shop.html"]').forEach((a) => a.setAttribute("aria-current", "page"));
    let p = null, sel = {}, img = 0, shown = false, barIo = null;

    function choose() {
      sel = { option: (p.options || [])[0] || null, material: (p.materials || [])[0] || "", colour: (p.colours || [])[0] || null, qty: 1, text: "" };
    }
    const unit = () => p.price + (sel.option ? sel.option.add || 0 : 0);
    const total = () => unit() * sel.qty;

    function seo() {
      document.title = `${p.title} | MakeMeProto Shop`;
      const desc = (p.description || `${p.title}, 3D printed in Ahmedabad.`).replace(/\s+/g, " ").slice(0, 155);
      $('meta[name="description"]')?.setAttribute("content", desc);
      let ld = $("#productLd");
      if (!ld) { ld = document.createElement("script"); ld.type = "application/ld+json"; ld.id = "productLd"; document.head.appendChild(ld); }
      ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.title, description: desc, image: p.images, sku: p.id, category: p.category,
        brand: { "@type": "Brand", name: "MakeMeProto" },
        offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, availability: "https://schema.org/MadeToOrder", url: location.href.split("#")[0] } });
    }

    function chips(list, cur, attr, label) {
      return list.map((x, i) => {
        const name = typeof x === "string" ? x : x.name, on = (typeof x === "string" ? x : x.name) === (typeof cur === "string" ? cur : cur && cur.name);
        return `<button type="button" class="ochip${on ? " is-on" : ""}" data-${attr}="${i}" aria-pressed="${on}">${esc(name)}${x.add ? ` <small>+${inr(x.add)}</small>` : ""}</button>`;
      }).join("");
    }

    function render() {
      if (!p) return;
      const pct = off(p), imgs = p.images || [];
      $("#pdpCrumbs").innerHTML = `<a href="shop.html">Shop</a><span aria-hidden="true">/</span><a href="shop.html?cat=${encodeURIComponent(p.category)}">${esc(p.category)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span>`;
      box.setAttribute("aria-busy", "false");
      box.innerHTML = `
        <div class="pdp__gallery">
          <div class="pdp__main">
            ${imgs.length ? `<img id="pdpImg" src="${esc(imgs[img] || imgs[0])}" alt="${esc(p.title)}">` : `<span class="pmedia pmedia--none pdp__none"><span class="pmedia__emoji" aria-hidden="true">${icon(p.category)}</span></span>`}
            ${imgs.length > 1 ? `<button type="button" class="pdp__nav pdp__nav--prev" data-step="-1" aria-label="${T("Pichli photo", "Previous photo")}">‹</button><button type="button" class="pdp__nav pdp__nav--next" data-step="1" aria-label="${T("Agli photo", "Next photo")}">›</button>` : ""}
            ${p.featured ? `<span class="pcard__sticker pcard__sticker--big hand">${T("Sabka favourite ⭐", "Crowd favourite ⭐")}</span>` : ""}
          </div>
          ${imgs.length > 1 ? `<div class="pdp__thumbs" role="group" aria-label="${T("Photos", "Photos")}">${(p.thumbs || imgs).map((t, i) => `<button type="button" class="pdp__thumb${i === img ? " is-on" : ""}" data-img="${i}" aria-label="${T("Photo", "Photo")} ${i + 1}"><img src="${esc(t)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
        </div>

        <div class="pdp__info">
          <p class="pcard__cat mono">${icon(p.category)} ${esc(p.category)}</p>
          <h1 class="pdp__title">${esc(p.title)}</h1>
          <p class="pdp__price"><span id="pdpUnit">${inr(unit())}</span>${p.was > p.price ? `<s>${inr(p.was + (sel.option ? sel.option.add || 0 : 0))}</s><span class="pbadge pbadge--sale">−${pct}%</span>` : ""}</p>
          ${pct ? `<p class="pdp__deal hand">${T("Abhi sasta hai! 🎉", "On sale right now! 🎉")}</p>` : ""}
          <ul class="pdp__facts">${[p.orders > 0 ? `<li>🔥 ${p.orders} ${T("logon ne liya", p.orders === 1 ? "order so far" : "orders so far")}</li>` : "", p.ships ? `<li>🚚 ${esc(p.ships)}</li>` : "", `<li>📍 ${T("Fresh print", "Printed fresh in")} ${esc(CONFIG.city)}</li>`].join("")}</ul>

          <form class="pdp__form" id="pdpForm" novalidate>
            <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
            ${(p.options || []).length ? `<div class="ogroup"><p class="ogroup__label">${T("Size chuno", "Choose a size")}</p><div class="ogroup__chips">${chips(p.options, sel.option, "opt")}</div></div>` : ""}
            ${(p.materials || []).length > 1 ? `<div class="ogroup"><p class="ogroup__label">${T("Material chuno", "Choose a material")}</p><div class="ogroup__chips">${chips(p.materials, sel.material, "mat")}</div></div>` : ""}
            ${(p.colours || []).length ? `<div class="ogroup"><p class="ogroup__label">${T("Rang", "Colour")}: <b>${esc(sel.colour ? sel.colour.name : "")}</b></p><div class="ogroup__swatches">${p.colours.map((c, i) => `<button type="button" class="oswatch${sel.colour === c ? " is-on" : ""}" data-col="${i}" aria-pressed="${sel.colour === c}" title="${esc(c.name)}"><i class="cdot" style="--c:${esc(c.hex || "#8E8E8E")}"></i><span class="sr-only">${esc(c.name)}</span></button>`).join("")}</div></div>` : ""}
            ${p.personalise ? `<label class="field ogroup"><span>✏️ ${esc(p.personalise)}</span><input type="text" id="pdpText" maxlength="40" value="${esc(sel.text)}" placeholder="${T("Jaise: Aarav", "e.g. Aarav")}"></label>` : ""}
            <div class="ogroup ogroup--row">
              <p class="ogroup__label">${T("Kitne chahiye?", "Quantity")}</p>
              <div class="qty"><button type="button" data-qty="-1" aria-label="${T("Kam", "Less")}">−</button><output id="pdpQty">${sel.qty}</output><button type="button" data-qty="1" aria-label="${T("Zyada", "More")}">+</button></div>
            </div>
            <div class="pdp__buy">
              <div class="field-row">
                <label class="field"><span>${T("Aapka naam", "Your name")}</span><input type="text" id="pdpName" autocomplete="name" maxlength="80" required></label>
                <label class="field"><span>WhatsApp</span><input type="tel" id="pdpPhone" autocomplete="tel" inputmode="tel" maxlength="16" placeholder="98765 43210" required></label>
              </div>
              <div class="pdp__total"><span class="mono">${T("Total", "Total")}</span><b id="pdpTotal">${inr(total())}</b></div>
              <p class="pdp__nudge hand" aria-hidden="true">${T("Pehle baat, phir payment 🤝", "Chat first, pay later 🤝")}</p>
              <button type="submit" class="btn btn--accent btn--block pdp__order">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>
                ${T("WhatsApp pe order karo", "Order on WhatsApp")}
              </button>
              <p class="pdp__hint" id="pdpHint" aria-live="polite"></p>
              <ul class="pdp__trust">
                <li><b>💬</b>${T("Abhi koi payment nahi", "No payment now")}</li>
                <li><b>🖨️</b>${T("Order pe fresh print", "Printed to order")}</li>
                <li><b>📦</b>${T("Ghar tak delivery", "Delivered to you")}</li>
              </ul>
            </div>
          </form>

          <div class="pdp__more">
            <h2 class="pdp__h">${T("Is design ke baare mein", "About this design")}</h2>
            ${p.description ? `<div class="pdp__desc">${esc(p.description).replace(/\n/g, "<br>")}</div>` : ""}
            <dl class="pdp__specs">
              ${p.size ? `<div><dt class="mono">${T("Size", "Size")}</dt><dd>${esc(p.size)}</dd></div>` : ""}
              ${(p.materials || []).length ? `<div><dt class="mono">Material</dt><dd>${esc(p.materials.join(", "))}</dd></div>` : ""}
              ${p.grams ? `<div><dt class="mono">${T("Weight", "Weight")}</dt><dd>${Math.round(p.grams)} g</dd></div>` : ""}
              ${p.hours ? `<div><dt class="mono">${T("Print time", "Print time")}</dt><dd>~${p.hours} h</dd></div>` : ""}
            </dl>
            <div class="pdp__actions">
              <a class="btn btn--ghost btn--sm" id="pdpAsk" href="#" target="_blank" rel="noopener">💬 ${T("Sawaal poochho", "Ask a question")}</a>
              <button type="button" class="btn btn--ghost btn--sm" id="pdpShare">🔗 ${T("Share karo", "Share")}</button>
            </div>
          </div>
        </div>`;
      // phones: a bar with the total and the order button, while the real button is off screen
      let bar = $("#pdpBar");
      if (!bar) { bar = document.createElement("div"); bar.id = "pdpBar"; bar.className = "pdpbar"; document.body.appendChild(bar); }
      bar.innerHTML = `<div class="pdpbar__price"><span class="mono">${T("Total", "Total")}</span><b id="pdpBarTotal">${inr(total())}</b></div><button type="button" class="btn btn--accent pdpbar__go">${T("Order karo", "Order now")} →</button>`;
      $(".pdpbar__go", bar).addEventListener("click", () => { $("#pdpName").scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => $("#pdpName").focus({ preventScroll: true }), 400); });
      if ("IntersectionObserver" in window) {
        barIo?.disconnect();
        barIo = new IntersectionObserver(([e]) => { const show = !e.isIntersecting && e.boundingClientRect.top > 0; bar.classList.toggle("is-on", show); document.body.classList.toggle("pdpbar-on", show); });
        barIo.observe($(".pdp__buy", box));
      }
      $("#pdpAsk").href = waLink(waFormat("Shop question", [["Product", `${p.title} (${p.id})`], ["Link", location.href.split("#")[0]], ["Question", ""]]));
      bind();
    }

    // re-draw, keeping what the visitor already typed
    function rerender() {
      const k = $("#pdpName") ? { name: $("#pdpName").value, phone: $("#pdpPhone").value, text: $("#pdpText") ? $("#pdpText").value : sel.text } : null;
      render();
      if (k) { $("#pdpName").value = k.name; $("#pdpPhone").value = k.phone; sel.text = k.text; if ($("#pdpText")) $("#pdpText").value = k.text; }
    }
    // update just the numbers (keeps typing focus)
    function refreshTotals() {
      $("#pdpUnit").textContent = inr(unit());
      $("#pdpTotal").textContent = inr(total());
      if ($("#pdpBarTotal")) $("#pdpBarTotal").textContent = inr(total());
      $("#pdpQty").textContent = sel.qty;
    }

    function bind() {
      const f = $("#pdpForm");
      box.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => { img = (img + +b.dataset.step + p.images.length) % p.images.length; rerender(); }));
      box.querySelectorAll("[data-img]").forEach((b) => b.addEventListener("click", () => { img = +b.dataset.img; rerender(); }));
      f.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => { sel.option = p.options[+b.dataset.opt]; rerender(); }));
      f.querySelectorAll("[data-mat]").forEach((b) => b.addEventListener("click", () => { sel.material = p.materials[+b.dataset.mat]; rerender(); }));
      f.querySelectorAll("[data-col]").forEach((b) => b.addEventListener("click", () => { sel.colour = p.colours[+b.dataset.col]; rerender(); }));
      f.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => { sel.qty = Math.min(99, Math.max(1, sel.qty + +b.dataset.qty)); refreshTotals(); }));
      $("#pdpText")?.addEventListener("input", (e) => { sel.text = e.target.value; });
      // swipe between photos on phones
      const main = $(".pdp__main", box);
      let x0 = null;
      main.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      main.addEventListener("touchend", (e) => { if (x0 == null || (p.images || []).length < 2) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { img = (img + (dx < 0 ? 1 : -1) + p.images.length) % p.images.length; rerender(); } x0 = null; });
      $("#pdpShare").addEventListener("click", async () => {
        const url = location.href.split("#")[0];
        try { if (navigator.share) await navigator.share({ title: p.title, text: `${p.title} · MakeMeProto`, url }); else { await navigator.clipboard.writeText(url); toast({ icon: "🔗", title: T("Link copy ho gaya", "Link copied"), timeout: 2500 }); } } catch (e) { /* cancelled */ }
      });
      f.addEventListener("submit", order);
      try { const me = JSON.parse(localStorage.getItem("mmp-me") || "null"); if (me) { if (!$("#pdpName").value) $("#pdpName").value = me.name || ""; if (!$("#pdpPhone").value) $("#pdpPhone").value = me.phone || ""; } } catch (e) { /* no storage */ }
    }

    async function order(e) {
      e.preventDefault();
      const hint = $("#pdpHint"), name = $("#pdpName").value.trim(), phone = $("#pdpPhone").value.trim(), text = ($("#pdpText")?.value || "").trim();
      const say = (m) => { hint.textContent = m; hint.classList.add("is-error"); };
      hint.classList.remove("is-error"); hint.textContent = "";
      if (name.length < 2) { say(T("Apna naam daalo.", "Please add your name.")); $("#pdpName").focus(); return; }
      if (!phoneOk(phone)) { say(T("10 digit ka WhatsApp number daalo.", "Please add a valid 10-digit WhatsApp number.")); $("#pdpPhone").focus(); return; }
      if (p.personalise && !text) { say(T(`"${p.personalise}" bhi likho.`, `Please fill in "${p.personalise}".`)); $("#pdpText").focus(); return; }
      try { localStorage.setItem("mmp-me", JSON.stringify({ name, phone })); } catch (err) { /* no storage */ }

      const link = location.href.split("#")[0];
      const rows = [["Product", p.title], ["Code", p.id], ["Option", sel.option ? sel.option.name : null], ["Material", sel.material || null], ["Colour", sel.colour ? sel.colour.name : null],
        [p.personalise || "Personalise", text || null], ["Quantity", sel.qty], ["Price", `${inr(unit())} × ${sel.qty} = ${inr(total())}`], ["Name", name]];
      const message = (ref) => waFormat("Shop order 🛍️", ref ? [["Ref", ref], ...rows] : rows, link);
      // open the WhatsApp tab now (inside the click, so it isn't blocked), fill it in once the order is saved
      const win = window.open("", "_blank");
      const btn = $(".pdp__order"); btn.classList.add("is-disabled");
      let ref = "";
      try {
        if (SAMPLE) throw new Error("sample products are never saved as orders");
        const res = await postEntry({ form: "quote", website: $('#pdpForm input[name="website"]').value, elapsed: Date.now() - PAGE_START, source: location.hostname || "local file",
          base: location.href.split(/[?#]/)[0].replace(/[^/]*$/, ""), lang: LANG, files: [],
          fields: { name, phone, product: p.id, material: sel.material, colour: sel.colour ? sel.colour.name : "", quantity: String(sel.qty), estimate: inr(total()),
            size: sel.option ? sel.option.name : p.size || "", weight: p.grams ? `${Math.round(p.grams)} g each` : "",
            notes: [`🛍️ Shop: ${p.title} (${p.id})`, sel.option ? `Option: ${sel.option.name}` : "", text ? `${p.personalise}: ${text}` : "", `Price shown: ${inr(unit())} × ${sel.qty} = ${inr(total())}`, link].filter(Boolean).join("\n") } });
        if (res && res.ok) ref = res.ref || "";
      } catch (err) { /* WhatsApp still works without the saved copy */ }
      btn.classList.remove("is-disabled");
      const wa = waLink(message(ref));
      if (win && !win.closed) win.location.href = wa; else location.href = wa;
      toast({ kind: "ok", icon: "✅", title: ref ? `${T("Order mil gaya", "Order received")} · ${ref}` : T("WhatsApp khul raha hai", "Opening WhatsApp"),
        text: T("WhatsApp pe message bhej do, hum jaldi confirm karenge.", "Send the message on WhatsApp and we'll confirm shortly."), timeout: 14000,
        actions: [...(ref ? [{ label: T("Order track karo", "Track order"), href: "track.html?ref=" + encodeURIComponent(ref), newTab: false }] : []), { label: "WhatsApp", href: wa, primary: true }] });
      window.mmpGuide?.cheer?.();
    }

    function related() {
      const others = (products || []).filter((x) => x.id !== p.id);
      const list = [...others.filter((x) => x.category === p.category), ...others.filter((x) => x.category !== p.category)].slice(0, 4);
      $("#related").hidden = !list.length;
      $("#relatedGrid").innerHTML = list.map(card).join("");
    }

    function show(final, failed) {
      const found = (products || []).find((x) => x.id === id) || (products || []).find((x) => x.slug && x.slug === params.get("n"));
      if (!found) {
        if (!final) return;   // wait for the live list
        box.setAttribute("aria-busy", "false");
        box.innerHTML = `<div class="pgrid__empty pdp__missing"><p class="pgrid__emoji" aria-hidden="true">${failed ? "📶" : "🤔"}</p><h1>${failed ? T("Load nahi hua", "Couldn't load this") : T("Ye product nahi mila", "This product isn't available")}</h1><p>${failed ? T("Internet check karke phir try karo.", "Check your connection and try again.") : T("Shayad ye ab shop mein nahi hai.", "It may have been taken off the shop.")}</p><a href="shop.html" class="btn btn--accent">🛍️ ${T("Shop dekho", "Browse the shop")}</a></div>`;
        return;
      }
      const changed = !p || JSON.stringify(found) !== JSON.stringify(p);
      if (!changed) return;
      const keepSel = p && p.id === found.id;
      p = found;
      if (!keepSel || !shown) choose();
      else {   // live data changed while open: keep choices that still exist
        sel.option = (p.options || []).find((o) => sel.option && o.name === sel.option.name) || (p.options || [])[0] || null;
        sel.colour = (p.colours || []).find((c) => sel.colour && c.name === sel.colour.name) || (p.colours || [])[0] || null;
        if (!(p.materials || []).includes(sel.material)) sel.material = (p.materials || [])[0] || "";
      }
      img = Math.min(img, Math.max(0, (p.images || []).length - 1));
      shown = true; seo(); rerender(); related();
    }
    addEventListener("mmp:lang", () => { if (p) { rerender(); related(); } });
    load(show);
  }

  document.addEventListener("DOMContentLoaded", () => (PAGE === "shop" ? initListing() : initProduct()));
})();
