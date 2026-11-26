/* QASSIMZ Music — UI + player */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ------------------------------------------------------------------ icons */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
  rooms: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  lib: '<path d="M4 19V5M9 19V5M14 5l5 14"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h9M3 6h.01M3 12h.01M3 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>', pause: '<path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/>',
  next: '<path d="M4 5.5v13l10.5-6.5z"/><rect x="16" y="5" width="3.2" height="14" rx="1.2"/>', prev: '<path d="M20 5.5v13L9.5 12z"/><rect x="4.8" y="5" width="3.2" height="14" rx="1.2"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>', repeat: '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  vol: '<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>', mute: '<path d="M11 5 6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6"/>',
  eq: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  queue: '<path d="M3 6h13M3 12h13M3 18h9M17 15v6l5-3z"/>', moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  full: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  open: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>', folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>', back: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  yt: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>', refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5"/>',
};
const ico = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24">${IC[n] || ""}</svg>`;
const icoF = (n) => `<svg class="i f" viewBox="0 0 24 24">${IC[n]}</svg>`;

/* ------------------------------------------------------------------ helpers */
async function api(m, args = {}) {
  const r = await fetch("api/" + m, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "خطأ");
  return j.data;
}
let toastT;
function toast(msg, err = false) { $$(".toast").forEach((t) => t.remove()); const t = document.createElement("div"); t.className = "toast" + (err ? " err" : ""); t.textContent = msg; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), err ? 5000 : 2600); }
const fmt = (s) => { if (!isFinite(s) || s <= 0) return "0:00"; s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`; };
const keyOf = (it) => `${it.source}:${it.id}`;
const initials = (t) => (String(t || "♪").trim().replace(/^(راديو|radio|إذاعة)\s+/i, "")[0] || "♪").toUpperCase();
const debounce = (fn, ms = 400) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const saveSettingsDebounced = debounce((values) => api("save_settings", { values }).catch(() => {}), 400);

function menu(anchor, items, at) {
  closeMenus();
  const m = document.createElement("div"); m.className = "menu";
  m.innerHTML = items.map((it, i) => it === "-" ? "<hr>" : `<button data-i="${i}">${it.icon ? ico(it.icon) : ""}<span>${esc(it.label)}</span></button>`).join("");
  document.body.appendChild(m);
  const r = at || anchor.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(innerWidth - mw - 8, (r.right ?? r.x) - mw)) + "px";
  m.style.top = Math.max(8, ((r.bottom ?? r.y) + mh + 8 > innerHeight ? (r.top ?? r.y) - mh - 6 : (r.bottom ?? r.y) + 6)) + "px";
  $$("button", m).forEach((b) => (b.onclick = () => { closeMenus(); items[+b.dataset.i].do(); }));
  setTimeout(() => document.addEventListener("mousedown", function o(e) { if (!m.contains(e.target)) { closeMenus(); document.removeEventListener("mousedown", o); } }), 0);
}
const closeMenus = () => $$(".menu").forEach((m) => m.remove());
function modal(html, wide) {
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="modal-box" style="${wide ? "width:min(860px,calc(100vw - 40px))" : ""}">${html}</div>`;
  m.close = () => m.remove();
  m.addEventListener("mousedown", (e) => e.target === m && m.close());
  $("#layer").appendChild(m); $$("[data-close]", m).forEach((b) => (b.onclick = m.close));
  return m;
}

/* ------------------------------------------------------------------ state */
const S = { info: null, favs: new Set(), route: { v: "home" }, back: [], playlists: [] };
const NAV = [["home", "الرئيسية", "home"], ["radio", "الراديو", "radio"], ["rooms", "الأنواع", "rooms"], ["search", "بحث", "search"],
  ["library", "أغانيّ على الجهاز", "lib"], ["favorites", "المفضلة", "heart"], ["history", "سمعتها قبل كده", "history"]];
function go(v, arg, push = true) { if (push) S.back.push(S.route); S.route = { v, arg }; render(); $("#main").scrollTop = 0; }

function renderNav() {
  $("#nav").innerHTML = NAV.map(([v, l, i], idx) => `<button class="nav ${S.route.v === v || (v === "rooms" && S.route.v === "room") ? "active" : ""}" data-v="${v}">${ico(i)}<span>${l}</span>${idx < 6 ? `<span class="k-hint">${idx + 1}</span>` : ""}</button>`).join("");
  $$("#nav .nav").forEach((b) => (b.onclick = () => go(b.dataset.v)));
  $("#plNav").innerHTML = S.playlists.length ? S.playlists.map((p) => `<button class="nav ${S.route.v === "playlist" && S.route.arg === p.id ? "active" : ""}" data-p="${p.id}">${ico("list")}<span class="ell">${esc(p.name)}</span></button>`).join("")
    : `<p class="muted" style="font-size:12px;padding:6px 12px">اعمل قايمة وضيف فيها اللي بتحبه</p>`;
  $$("#plNav .nav").forEach((b) => (b.onclick = () => go("playlist", +b.dataset.p)));
  const tp = $("#topPageTitle");
  if (tp) {
    const navMatch = NAV.find(([v]) => v === S.route.v);
    if (navMatch) tp.textContent = navMatch[1];
    else if (S.route.v === "room") tp.textContent = S.info?.rooms?.find((r) => r.id === S.route.arg)?.name || "الأنواع";
    else if (S.route.v === "playlist") tp.textContent = S.playlists.find((p) => p.id === S.route.arg)?.name || "قايمة تشغيل";
    else if (S.route.v === "album") tp.textContent = "ألبوم";
  }
}
async function refreshPlaylists() { S.playlists = await api("playlists"); renderNav(); }

/* ------------------------------------------------------------------ item rendering */
const LISTS = {}; let listSeq = 0;
function resetLists() { for (const k of Object.keys(LISTS)) delete LISTS[k]; listSeq = 0; }
function reg(list) {
  const keys = Object.keys(LISTS);
  if (keys.length > 64) { for (const k of keys.slice(0, keys.length - 32)) delete LISTS[k]; }
  const id = "L" + ++listSeq;
  LISTS[id] = list;
  return id;
}

async function render() {
  resetLists();
  renderNav();
  const main = $("#main");
  try {
    await ({ home: vHome, radio: vRadio, rooms: vRooms, room: vRoom, search: vSearch, album: vAlbum, library: vLibrary, favorites: vFavs, history: vHistory, playlist: vPlaylist })[S.route.v](main, S.route.arg);
  } catch (e) { main.innerHTML = `<div class="view"><div class="glass empty">${ico("radio")}<b>حصلت مشكلة</b><span>${esc(e.message)}</span><button class="btn" onclick="render()">${ico("refresh")}جرّب تاني</button></div></div>`; }
  markPlaying();
}
const loading = (main, title) => (main.innerHTML = `<div class="view"><div class="top"><h1>${title}</h1></div><div class="glass empty"><div class="eqbars" style="height:30px"><i></i><i></i><i></i></div><span>بيحمّل…</span></div></div>`);

function cardHTML(it, lid, i) {
  const cls = it.source === "radio" ? "station" : "";
  const art = it.art ? `<img loading="lazy" src="${esc(it.art)}" onerror="this.remove()">` : "";
  const tag = it.live ? `<span class="live tagx">LIVE</span>` : it.source === "youtube" ? `<span class="chip tagx" style="padding:2px 8px">${ico("yt")}</span>` : it.is_album ? `<span class="chip tagx" style="padding:2px 9px;font-size:11px">ألبوم</span>` : "";
  return `<div class="card" data-l="${lid}" data-i="${i}" data-k="${esc(keyOf(it))}"><div class="cover ${cls}"><span class="ini">${esc(initials(it.title))}</span>${art}${tag}<button class="play">${icoF("play")}</button></div>
    <div class="t" title="${esc(it.title)}">${esc(it.title)}</div><div class="s">${esc(it.subtitle || "")}</div></div>`;
}
function rowHTML(title, list, extra = "", grid = false) {
  if (!list || !list.length) return "";
  const lid = reg(list);
  return `<section><div class="sec-h"><h2>${title}</h2>${extra}</div><div class="${grid ? "grid" : "row"}">${list.map((it, i) => cardHTML(it, lid, i)).join("")}</div></section>`;
}
function trackListHTML(list, numbered = true, removable = false) {
  const lid = reg(list);
  return `<div class="tlist glass">${list.map((it, i) => `<div class="tr" data-l="${lid}" data-i="${i}" data-k="${esc(keyOf(it))}">
    <span class="n" data-n="${numbered ? i + 1 : ""}">${numbered ? i + 1 : ""}</span><div class="art">${it.art ? `<img loading="lazy" src="${esc(it.art)}" onerror="this.remove()">` : ico(it.source === "radio" ? "radio" : "disc")}</div>
    <div style="min-width:0"><div class="tt">${esc(it.title)}</div><div class="ss">${esc(it.subtitle || "")}</div></div>
    <span class="d">${it.live ? '<span class="live">LIVE</span>' : fmt(it.duration)}</span>
    <div class="acts"><button class="ib" data-fav title="المفضلة">${S.favs.has(keyOf(it)) ? icoF("heart") : ico("heart")}</button><button class="ib" data-more title="المزيد">${ico("dots")}</button>${removable ? `<button class="ib" data-rm title="شيل">${ico("x")}</button>` : ""}</div></div>`).join("")}</div>`;
}
function wireItems(root) {
  $$(".card, .tr", root).forEach((el) => {
    const list = LISTS[el.dataset.l], i = +el.dataset.i, it = list && list[i];
    if (!it) return;
    el.onclick = (e) => {
      if (e.target.closest("[data-fav]")) return toggleFav(it, e.target.closest("[data-fav]"));
      if (e.target.closest("[data-more]")) return itemMenu(it, e.target.closest("[data-more]"));
      if (e.target.closest("[data-rm]")) return;
      if (it.is_album) return go("album", it.id);
      if (P.cur && keyOf(P.cur) === keyOf(it)) return togglePlay();
      const playable = list.filter((x) => !x.is_album);
      playList(playable, playable.indexOf(it));
    };
    el.oncontextmenu = (e) => { e.preventDefault(); itemMenu(it, el, { x: e.clientX, y: e.clientY, right: e.clientX, bottom: e.clientY, top: e.clientY }); };
  });
}
function itemMenu(it, anchor, at) {
  if (it.is_album) return menu(anchor, [{ label: "افتح الألبوم", icon: "disc", do: () => go("album", it.id) }, { label: "صفحته على archive.org", icon: "open", do: () => api("open_url", { url: it.permalink }) }], at);
  const items = [
    { label: "شغّل التالي", icon: "next", do: () => { P.queue.splice(Math.max(0, P.idx + 1), 0, it); toast("✓ هيتشغل بعد اللي شغال"); renderQueue(); } },
    { label: "ضيف لقايمة الانتظار", icon: "queue", do: () => { P.queue.push(it); toast("✓ اتضاف للانتظار"); renderQueue(); } },
    { label: S.favs.has(keyOf(it)) ? "شيل من المفضلة" : "ضيف للمفضلة", icon: "heart", do: () => toggleFav(it) },
    { label: "ضيف لقايمة تشغيل…", icon: "list", do: () => addToPlaylist(it) },
  ];
  if (it.permalink || it.homepage) items.push("-", { label: it.source === "audius" ? "صفحة الفنان على Audius" : it.source === "youtube" ? "افتح على يوتيوب" : it.source === "archive" ? "صفحته على archive.org" : "موقع المحطة", icon: "open", do: () => api("open_url", { url: it.permalink || it.homepage }) });
  if (it.source === "local") items.push("-", { label: "اعرضه في الفولدر", icon: "folder", do: () => api("reveal", { path: it.path }) });
  menu(anchor, items, at);
}
async function toggleFav(it, btn) {
  const on = await api("toggle_fav", { item: clean(it) });
  on ? S.favs.add(keyOf(it)) : S.favs.delete(keyOf(it));
  if (btn) btn.innerHTML = on ? icoF("heart") : ico("heart");
  if (P.cur && keyOf(P.cur) === keyOf(it)) updateFavBtn();
  toast(on ? "♥ اتضاف للمفضلة" : "اتشال من المفضلة");
}
const clean = (it) => Object.fromEntries(Object.entries(it).filter(([k]) => !k.startsWith("_")));
async function addToPlaylist(it) {
  const pls = await api("playlists");
  const m = modal(`<div class="modal-h"><h2>ضيف لقايمة تشغيل</h2><button class="ib" data-close>${ico("x")}</button></div>
    <div class="tlist">${pls.map((p) => `<div class="tr" data-p="${p.id}" style="grid-template-columns:46px 1fr auto"><div class="art">${ico("list")}</div><div class="tt">${esc(p.name)}</div><span class="d">${p.count}</span></div>`).join("")}</div>
    <div class="search-big"><input class="in" id="nPl" placeholder="أو اعمل قايمة جديدة…"><button class="btn gold" id="nPlGo">${ico("plus")}إنشاء</button></div>`);
  $$("[data-p]", m).forEach((r) => (r.onclick = async () => { await api("playlist_add", { id: +r.dataset.p, item: clean(it) }); m.close(); toast("✓ اتضافت"); refreshPlaylists(); }));
  $("#nPlGo", m).onclick = async () => { const n = $("#nPl", m).value.trim(); if (!n) return; await api("playlist_create", { name: n, item: clean(it) }); m.close(); toast("✓ اتعملت القايمة"); refreshPlaylists(); };
}

/* ================================================================== VIEWS */
const ringSVG = () => {
  let b = "";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, h = 9 + 9 * Math.abs(Math.sin(i * 1.7)) + 6 * Math.abs(Math.sin(i * 0.6));
    b += `<line x1="${75 + 46 * Math.cos(a)}" y1="${75 + 46 * Math.sin(a)}" x2="${75 + (46 + h) * Math.cos(a)}" y2="${75 + (46 + h) * Math.sin(a)}"/>`;
  }
  return `<svg class="ring" viewBox="0 0 150 150"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset=".5" stop-color="#F59E0B"/><stop offset="1" stop-color="#D97706"/></linearGradient></defs><g stroke="url(#rg)" stroke-width="3" stroke-linecap="round">${b}</g><circle cx="75" cy="75" r="40" fill="#0B0E14" stroke="url(#rg)" stroke-width="2"/><path d="M66 58v34l28-17z" fill="url(#rg)"/></svg>`;
};
function roomsHTML(rooms) {
  return `<div class="rooms">${rooms.map((r) => `<div class="room" data-room="${r.id}" style="background:linear-gradient(135deg,${r.grad[0]},${r.grad[1]})"><div class="bars">${[0, 1, 2, 3].map((i) => `<i style="animation-delay:${-i * 0.27}s"></i>`).join("")}</div><b>${esc(r.name)}</b><small>${esc(r.en)}</small></div>`).join("")}</div>`;
}
function wireRooms(root) { $$("[data-room]", root).forEach((r) => (r.onclick = () => go("room", r.dataset.room))); }

async function vHome(main) {
  const h = new Date().getHours();
  main.innerHTML = `<div class="view">
    <div class="hero glass">${ringSVG()}<div style="flex:1;min-width:0"><div class="hero-kicker">LIVE WORLD RADIO &amp; AUDIOPHILE DECK</div><h1>${h < 12 ? "صباح الفل" : h < 18 ? "أهلاً بيك" : "مساء الطرب"}</h1>
      <p>راديو لايف من كل حتة في العالم، ومهرجانات وشعبي وطرب وأجنبي — بإكولايزر احترافي وصوت نقي في مكان واحد.</p>
      <div class="search-big" style="margin-top:14px;max-width:560px"><input class="in" id="hQ" placeholder="دوّر على محطة، أغنية، فنان… (Ctrl+K)"><button class="btn gold" id="hGo">${ico("search")}بحث</button></div></div></div>
    <section><div class="sec-h"><h2>الأنواع</h2><button class="btn sm ghost" id="allRooms">الكل ${ico("back")}</button></div>${roomsHTML(S.info.rooms.slice(0, 8))}</section>
    <div id="hDyn" style="display:flex;flex-direction:column;gap:24px"><div class="glass empty"><div class="eqbars" style="height:30px"><i></i><i></i><i></i></div><span>بيجيب المحطات والأغاني…</span></div></div></div>`;
  wireRooms(main);
  $("#allRooms").onclick = () => go("rooms");
  const doSearch = () => { const q = $("#hQ").value.trim(); if (q) go("search", q); };
  $("#hGo").onclick = doSearch; $("#hQ").onkeydown = (e) => e.key === "Enter" && doSearch();
  const d = await api("home");
  if (!$("#hDyn", main)) return;
  const cName = S.countryName || "بلدك";
  $("#hDyn").innerHTML = [
    rowHTML("كمّل من حيث وقفت", d.history),
    rowHTML(`${ico("radio")} إذاعات ${esc(cName)} <span class="live">LIVE</span>`, d.local_radio, `<button class="btn sm ghost" data-go="radio">كل الإذاعات ${ico("back")}</button>`),
    rowHTML("الأكتر سماعاً على Audius", d.trending),
    rowHTML(`${ico("globe")} الأشهر في العالم <span class="live">LIVE</span>`, d.world_radio),
    rowHTML(`${ico("heart")} المفضلة`, d.favorites),
    Object.keys(d.errors || {}).length ? `<p class="err-note">بعض المصادر مش متاحة دلوقتي: ${esc(Object.keys(d.errors).join("، "))} — اتأكد من النت.</p>` : "",
  ].join("") || `<div class="glass empty">${ico("radio")}<b>مفيش اتصال بالنت</b><span>تقدر تسمع أغانيك اللي على الجهاز من «أغانيّ على الجهاز»</span></div>`;
  $$("[data-go]", main).forEach((b) => (b.onclick = () => go(b.dataset.go)));
  wireItems(main);
  markPlaying();
}

let RADIO = { tag: "", country: "", q: "", order: "clickcount" };
async function vRadio(main) {
  main.innerHTML = `<div class="view"><div class="top"><div><h1>الراديو المباشر</h1><p class="muted">آلاف المحطات اللايف من كل دول العالم بجودة بث مستمرة</p></div></div>
    <div class="glass" style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <div class="search-big"><input class="in" id="rQ" value="${esc(RADIO.q)}" placeholder="اسم المحطة… (نجوم إف إم، مونت كارلو، BBC…)">
        <select class="sel" id="rCountry" style="width:220px"><option value="">كل الدول</option></select>
        <select class="sel" id="rOrder" style="width:175px"><option value="clickcount">الأكتر سماعاً</option><option value="votes">الأعلى تقييماً</option><option value="clicktrend">الصاعدة دلوقتي</option><option value="random">عشوائي</option></select></div>
      <div class="chips" id="rTags"></div></div>
    <div id="rList"></div></div>`;
  $("#rOrder").value = RADIO.order;
  const tags = ["", "pop", "news", "arabic", "egyptian", "quran", "shaabi", "rock", "jazz", "classical", "dance", "hiphop", "chillout", "oldies", "80s", "lofi", "talk", "sport"];
  const TAG_AR = { "": "الكل", pop: "بوب", news: "أخبار", arabic: "عربي", egyptian: "مصري", quran: "قرآن", shaabi: "شعبي", rock: "روك", jazz: "جاز", classical: "كلاسيك", dance: "دانس", hiphop: "هيب هوب", chillout: "هادي", oldies: "قديم", "80s": "التمانينات", lofi: "لو-فاي", talk: "برامج", sport: "رياضة" };
  $("#rTags").innerHTML = tags.map((t) => `<button class="chip ${RADIO.tag === t ? "on" : ""}" data-t="${t}">${TAG_AR[t]}</button>`).join("");
  $$("#rTags .chip").forEach((c) => (c.onclick = () => { RADIO.tag = c.dataset.t; $$("#rTags .chip").forEach((x) => x.classList.toggle("on", x === c)); load(); }));
  api("radio_countries").then((cs) => { if (!$("#rCountry")) return; $("#rCountry").innerHTML = `<option value="">كل الدول</option>` + cs.map((c) => `<option value="${esc(c.code)}">${esc(c.name)} (${c.count})</option>`).join(""); $("#rCountry").value = RADIO.country; }).catch(() => {});
  $("#rCountry").onchange = (e) => { RADIO.country = e.target.value; load(); };
  $("#rOrder").onchange = (e) => { RADIO.order = e.target.value; load(); };
  $("#rQ").oninput = debounce((e) => { RADIO.q = e.target.value.trim(); load(); }, 450);
  async function load() {
    if (!$("#rList")) return;
    $("#rList").innerHTML = `<div class="glass empty"><div class="eqbars" style="height:30px"><i></i><i></i><i></i></div></div>`;
    try {
      const list = await api("radio_browse", { tag: RADIO.tag || null, country: RADIO.country || null, name: RADIO.q || null, order: RADIO.order });
      if (!$("#rList")) return;
      if (list.length) {
        const lid = reg(list);
        $("#rList").innerHTML = `<div class="grid">${list.map((it, i) => cardHTML(it, lid, i)).join("")}</div>`;
        wireItems($("#rList"));
      } else {
        $("#rList").innerHTML = `<div class="glass empty">${ico("radio")}<b>مفيش محطات</b><span>غيّر البحث أو الدولة</span></div>`;
      }
      markPlaying();
    } catch (e) { if ($("#rList")) $("#rList").innerHTML = `<div class="glass empty">${ico("radio")}<b>مقدرتش أوصل لدليل المحطات</b><span>${esc(e.message)}</span></div>`; }
  }
  load();
}

async function vRooms(main) {
  main.innerHTML = `<div class="view"><div class="top"><div><h1>الأنواع الموسيقية</h1><p class="muted">من المهرجانات والشعبي والطرب لحد الجاز والكي بوب</p></div></div>${roomsHTML(S.info.rooms)}</div>`;
  wireRooms(main);
}

async function vRoom(main, id) {
  const r0 = S.info.rooms.find((r) => r.id === id);
  loading(main, esc(r0.name));
  const d = await api("room", { id });
  const yt = !S.info.settings.has_youtube && ["mahraganat", "shaabi", "arabic", "khaleeji"].includes(id)
    ? `<p class="muted" style="font-size:13px;padding:0 4px">عايز أغاني المهرجانات والشعبي المشهورة نفسها؟ فعّل يوتيوب من الإعدادات (مجاني).</p>` : "";
  main.innerHTML = `<div class="view">
    <div class="hero" style="border-radius:20px;background:linear-gradient(135deg,${r0.grad[0]}dd,${r0.grad[1]}aa);border:1px solid rgba(255,255,255,.14)">
      <div><small style="letter-spacing:2px;opacity:.85;direction:ltr;display:inline-block">${esc(r0.en.toUpperCase())}</small><h1 style="color:#fff;font-size:38px">${esc(r0.name)}</h1>
      <div class="actions"><button class="btn gold" id="rPlayAll">${icoF("play")}شغّل</button><button class="btn" id="rShuffle">${ico("shuffle")}عشوائي</button></div></div></div>
    ${yt}
    ${rowHTML(`${ico("radio")} محطات <span class="live">LIVE</span>`, d.stations)}
    ${rowHTML(`${ico("yt")} من يوتيوب`, d.videos)}
    ${rowHTML("أغاني (Audius)", d.tracks)}
    ${rowHTML(`${ico("disc")} تسجيلات نادرة (Internet Archive)`, d.albums)}
    ${!d.stations.length && !d.tracks.length && !d.albums.length && !d.videos.length ? `<div class="glass empty">${ico("radio")}<b>مفيش نتايج دلوقتي</b><span>${esc(Object.values(d.errors || {})[0] || "جرّب بعد شوية")}</span></div>` : ""}
  </div>`;
  wireItems(main);
  const all = [...d.videos, ...d.tracks, ...d.stations];
  $("#rPlayAll").onclick = () => all.length && playList(all, 0);
  $("#rShuffle").onclick = () => { if (!all.length) return; P.shuffle = true; updateModes(); playList(all, Math.floor(Math.random() * all.length)); };
}

async function vSearch(main, q) {
  main.innerHTML = `<div class="view"><div class="top"><div><h1>بحث شامل</h1><p class="muted">ابحث في الراديو، أغانيك المحلية، Audius، Internet Archive، ويوتيوب</p></div></div>
    <div class="search-big"><input class="in" id="sQ" value="${esc(q || "")}" placeholder="محطة، أغنية، فنان، ألبوم…" autofocus><button class="btn gold" id="sGo">${ico("search")}بحث</button></div><div id="sRes" style="display:flex;flex-direction:column;gap:24px"></div></div>`;
  const run = async () => {
    const v = $("#sQ").value.trim(); if (!v) return;
    S.route.arg = v;
    $("#sRes").innerHTML = `<div class="glass empty"><div class="eqbars" style="height:30px"><i></i><i></i><i></i></div><span>بيدوّر في كل المصادر…</span></div>`;
    const d = await api("search", { q: v });
    if (!$("#sRes")) return;
    $("#sRes").innerHTML = [rowHTML("على جهازك", d.local), rowHTML(`${ico("yt")} يوتيوب`, d.videos), rowHTML(`${ico("radio")} محطات`, d.stations), rowHTML("أغاني (Audius)", d.tracks), rowHTML(`${ico("disc")} Internet Archive`, d.albums)].join("")
      || `<div class="glass empty">${ico("search")}<b>مفيش نتايج لـ «${esc(v)}»</b><span>${S.info.settings.has_youtube ? "جرّب كلمة تانية" : "فعّل يوتيوب من الإعدادات عشان تلاقي الأغاني المشهورة"}</span></div>`;
    wireItems($("#sRes")); markPlaying();
  };
  $("#sGo").onclick = run; $("#sQ").onkeydown = (e) => e.key === "Enter" && run();
  if (q) run(); else $("#sQ").focus();
}

async function vAlbum(main, id) {
  loading(main, "ألبوم");
  const d = await api("archive_album", { id });
  const art = d.tracks[0]?.art;
  main.innerHTML = `<div class="view"><div class="album-head glass"><div class="cover">${art ? `<img src="${esc(art)}" onerror="this.remove()">` : ""}<span class="ini">${esc(initials(d.title))}</span></div>
    <div style="min-width:0"><small class="muted">ألبوم · Internet Archive</small><h1 style="font-size:28px">${esc(d.title)}</h1><p class="muted">${esc(d.creator)} · ${d.tracks.length} تراك</p>
    <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"><button class="btn gold" id="aPlay">${icoF("play")}شغّل</button><button class="btn" id="aBack">${ico("back")}رجوع</button></div></div></div>
    ${d.tracks.length ? trackListHTML(d.tracks) : `<div class="glass empty">${ico("disc")}<b>مفيش ملفات صوت متاحة</b></div>`}</div>`;
  wireItems(main);
  $("#aPlay").onclick = () => d.tracks.length && playList(d.tracks, 0);
  $("#aBack").onclick = () => history_back();
}

async function vLibrary(main) {
  const list = await api("local");
  const dirs = S.info.settings.music_dirs || [];
  main.innerHTML = `<div class="view"><div class="top"><div><h1>أغانيّ على الجهاز</h1><p class="muted">${list.length} أغنية من: ${dirs.map(esc).join("، ") || "—"}</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="lAdd">${ico("folder")}ضيف فولدر</button><button class="btn" id="lScan">${ico("refresh")}حدّث</button>${list.length ? `<button class="btn gold" id="lPlay">${icoF("play")}شغّل الكل</button>` : ""}</div></div>
    ${list.length ? `<input class="in" id="lQ" placeholder="دوّر في أغانيك…" style="max-width:360px">` + `<div id="lList">${trackListHTML(list)}</div>` : `<div class="glass empty">${ico("lib")}<b>مفيش أغاني لسه</b><span>ضيف الفولدر اللي فيه أغانيك (MP3, FLAC, M4A…)</span></div>`}</div>`;
  wireItems(main);
  $("#lAdd").onclick = async () => { if (!S.info.native) return toast("متاحة من البرنامج المتسطب", true); const d = await api("add_music_dir"); S.info.settings.music_dirs = d; toast("✓ بيضيف الأغاني…"); setTimeout(render, 2500); };
  $("#lScan").onclick = async () => { const r = await api("scan"); toast(`✓ ${r.total ?? ""} أغنية`); render(); };
  if (list.length) {
    $("#lPlay").onclick = () => playList(list, 0);
    $("#lQ").oninput = debounce(async (e) => { const l = await api("local", { q: e.target.value }); if (!$("#lList")) return; $("#lList").innerHTML = trackListHTML(l); wireItems($("#lList")); markPlaying(); }, 250);
  }
}
async function vFavs(main) {
  const list = await api("favorites");
  const st = list.filter((x) => x.live), tr = list.filter((x) => !x.live);
  main.innerHTML = `<div class="view"><div class="top"><div><h1>المفضلة</h1><p class="muted">${list.length} عنصر محفوظ</p></div>${tr.length ? `<button class="btn gold" id="fPlay">${icoF("play")}شغّل الأغاني</button>` : ""}</div>
    ${list.length ? rowHTML(`${ico("radio")} محطات`, st, "", true) + (tr.length ? `<section><div class="sec-h"><h2>أغاني</h2></div>${trackListHTML(tr)}</section>` : "") : `<div class="glass empty">${ico("heart")}<b>مفيش مفضلة لسه</b><span>دوس ♥ على أي محطة أو أغنية</span></div>`}</div>`;
  wireItems(main);
  if (tr.length) $("#fPlay").onclick = () => playList(tr, 0);
}
async function vHistory(main) {
  const list = await api("history");
  main.innerHTML = `<div class="view"><div class="top"><div><h1>سمعتها قبل كده</h1></div>${list.length ? `<button class="btn" id="hClr">${ico("trash")}امسح السجل</button>` : ""}</div>
    ${list.length ? trackListHTML(list, false) : `<div class="glass empty">${ico("history")}<b>السجل فاضي</b></div>`}</div>`;
  wireItems(main);
  if (list.length) $("#hClr").onclick = async () => { await api("clear_history"); render(); };
}
async function vPlaylist(main, id) {
  const p = await api("playlist", { id });
  if (!p) return go("home");
  main.innerHTML = `<div class="view"><div class="top"><div><small class="muted">قايمة تشغيل</small><h1>${esc(p.name)}</h1><p class="muted">${p.items.length} عنصر</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${p.items.length ? `<button class="btn gold" id="pPlayAll">${icoF("play")}شغّل</button><button class="btn" id="pShuf">${ico("shuffle")}عشوائي</button>` : ""}<button class="btn icon" id="pMore">${ico("dots")}</button></div></div>
    ${p.items.length ? trackListHTML(p.items, true, true) : `<div class="glass empty">${ico("list")}<b>القايمة فاضية</b><span>من أي أغنية أو محطة: ⋯ ← ضيف لقايمة تشغيل</span></div>`}</div>`;
  wireItems(main);
  $$("[data-rm]", main).forEach((b) => (b.onclick = async (e) => { e.stopPropagation(); const row = b.closest(".tr"); await api("playlist_remove", { row: LISTS[row.dataset.l][+row.dataset.i]._pid }); render(); refreshPlaylists(); }));
  if (p.items.length) { $("#pPlayAll").onclick = () => playList(p.items, 0); $("#pShuf").onclick = () => { P.shuffle = true; updateModes(); playList(p.items, Math.floor(Math.random() * p.items.length)); }; }
  $("#pMore").onclick = (e) => menu(e.currentTarget, [
    { label: "غيّر الاسم", icon: "settings", do: async () => { const n = prompt("الاسم الجديد:", p.name); if (n) { await api("playlist_rename", { id, name: n }); refreshPlaylists(); render(); } } },
    { label: "امسح القايمة", icon: "trash", do: async () => { if (confirm("مسح القايمة؟")) { await api("playlist_delete", { id }); await refreshPlaylists(); go("home"); } } },
  ]);
}
function history_back() { const r = S.back.pop(); if (r) { S.route = r; render(); } }

/* ================================================================== PLAYER */
const P = { queue: [], idx: -1, cur: null, shuffle: false, repeat: "off", playing: false, yt: null, ytReady: false, sleepAt: 0, npTimer: 0 };
const audio = $("#audio");
let actx, srcNode, analyser, filters = [], gainNode;

function initAudioGraph() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    srcNode = actx.createMediaElementSource(audio);
    filters = S.info.eq_bands.map((f, i, a) => { const b = actx.createBiquadFilter(); b.type = i === 0 ? "lowshelf" : i === a.length - 1 ? "highshelf" : "peaking"; b.frequency.value = f; b.Q.value = 1.1; b.gain.value = 0; return b; });
    analyser = actx.createAnalyser(); analyser.fftSize = 512; analyser.smoothingTimeConstant = 0.82;
    gainNode = actx.createGain();
    let n = srcNode; for (const f of filters) { n.connect(f); n = f; } n.connect(gainNode); gainNode.connect(analyser); analyser.connect(actx.destination);
    applyEQ(eqValues());
  } catch (e) { console.warn("audio graph", e); }
}
function eqValues() { const st = S.info.settings; return st.eq === "custom" ? st.eq_custom : (S.info.eq_presets[st.eq] || S.info.eq_presets.flat); }
function applyEQ(vals) { filters.forEach((f, i) => (f.gain.value = vals[i] || 0)); }

function playList(list, i) { P.queue = list.slice(); P.idx = Math.max(0, i); P.order = null; playCurrent(); }
async function playCurrent() {
  const it = P.queue[P.idx]; if (!it) return;
  P.cur = it;
  stopAll();
  if (it.source === "youtube") playYT(it);
  else {
    initAudioGraph(); actx && actx.state === "suspended" && actx.resume();
    $("#ytBox")?.remove();
    const src = it.source === "local"
      ? `local/${it.id}`
      : `stream?u=${encodeURIComponent(it.url)}${it.live ? `&sid=${encodeURIComponent(keyOf(it))}` : ""}`;
    audio.src = src;
    audio.play().catch((e) => { if (e.name !== "AbortError") onAudioError(); });
  }
  api("played", { item: clean(it) }).catch(() => {});
  updateNowPlaying(); markPlaying(); renderQueue();
  clearInterval(P.npTimer);
  if (it.live) { const poll = async () => { const t = await api("now_playing", { sid: keyOf(it) }).catch(() => ""); if (P.cur === it) setIcy(t); }; setTimeout(poll, 3000); P.npTimer = setInterval(poll, 10000); }
}
function stopAll() { audio.pause(); if (P.yt && P.ytReady) try { P.yt.stopVideo(); } catch (e) {} }
function resetPlayerBar() {
  $("#pCover").innerHTML = '<span class="ini">♪</span>';
  $("#pCover").classList.remove("station");
  $("#pTitle").textContent = "اختار حاجة تسمعها";
  $("#pSub").textContent = "راديو مباشر، مهرجانات، شعبي، طرب، وعالمي…";
  $("#bgArt").style.backgroundImage = "none";
  $("#pBar").classList.remove("live-bar");
  $("#pCur").textContent = "0:00";
  $("#pDur").textContent = "0:00";
  $("#pFill").style.width = "0";
  document.title = "QASSIMZ Music";
  updateFavBtn();
  closeFull();
}
function onAudioError() {
  if (!P.cur || P.cur.source === "youtube") return;
  toast(P.cur.live ? "المحطة دي مش شغالة دلوقتي — بنقلك على اللي بعدها" : "الملف ده مش راضي يشتغل", true);
  setTimeout(() => next(true), 1200);
}
audio.addEventListener("error", () => audio.src && !audio.src.endsWith("/") && onAudioError());
audio.addEventListener("play", () => startLoop());
audio.addEventListener("playing", () => setPlaying(true));
audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("ended", () => (P.repeat === "one" ? (audio.currentTime = 0, audio.play()) : next()));
audio.addEventListener("waiting", () => $("#pSub") && ($("#pSub").dataset.buf = "1"));

function togglePlay() {
  if (!P.cur) { const c = $(".card, .tr"); return c && c.click(); }
  if (P.cur.source === "youtube") { if (!P.ytReady) return; P.playing ? P.yt.pauseVideo() : P.yt.playVideo(); return; }
  if (audio.paused) {
    actx && actx.resume();
    if (P.cur.live) {
      audio.src = `stream?u=${encodeURIComponent(P.cur.url)}&sid=${encodeURIComponent(keyOf(P.cur))}&_t=${Date.now()}`;
    }
    audio.play().catch(onAudioError);
  } else audio.pause();
}
function order() { if (!P.shuffle) return null; if (!P.order || P.order.length !== P.queue.length) { P.order = P.queue.map((_, i) => i).sort(() => Math.random() - 0.5); } return P.order; }
function next(auto = false) {
  if (!P.queue.length) return;
  const o = order();
  if (o) { const pos = o.indexOf(P.idx); if (pos + 1 >= o.length && P.repeat !== "all" && auto) return setPlaying(false); P.idx = o[(pos + 1) % o.length]; }
  else { if (P.idx + 1 >= P.queue.length) { if (P.repeat !== "all" && !auto) { P.idx = 0; } else if (P.repeat !== "all") return setPlaying(false); else P.idx = 0; } else P.idx++; }
  playCurrent();
}
function prev() {
  if (!P.queue.length) return;
  if (P.cur && !P.cur.live && P.cur.source !== "youtube" && audio.currentTime > 4) { audio.currentTime = 0; return; }
  const o = order();
  if (o) { const pos = o.indexOf(P.idx); P.idx = o[(pos - 1 + o.length) % o.length]; } else P.idx = (P.idx - 1 + P.queue.length) % P.queue.length;
  playCurrent();
}
function setPlaying(on) {
  P.playing = on;
  $("#pPlay").innerHTML = on ? icoF("pause") : icoF("play");
  document.body.classList.toggle("paused", !on);
  const f = $(".full"); if (f) { f.classList.toggle("paused", !on); $("#fPlay", f) && ($("#fPlay", f).innerHTML = on ? icoF("pause") : icoF("play")); }
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = on ? "playing" : "paused";
  if (on) startLoop();
  else if (!P.sleepAt) {
    stopLoop();
    drawIdleVisuals();
  }
}
function setIcy(t) {
  P.icy = t || "";
  const sub = $("#pSub"); if (!sub || !P.cur) return;
  sub.innerHTML = t ? `<span class="icy">♪ ${esc(t)}</span>` : esc(P.cur.subtitle || "");
  const fi = $("#fIcy"); if (fi) fi.textContent = t ? "♪ " + t : "";
  if ("mediaSession" in navigator && P.cur && t) navigator.mediaSession.metadata = new MediaMetadata({ title: t, artist: P.cur.title, album: "QASSIMZ Music", artwork: P.cur.art ? [{ src: P.cur.art, sizes: "512x512" }] : [] });
}
function coverHTML(it, cls = "") { return `<span class="ini">${esc(initials(it.title))}</span>${it.art ? `<img src="${esc(it.art)}" onerror="this.remove()" class="${cls}">` : ""}`; }
function updateNowPlaying() {
  const it = P.cur; if (!it) return;
  $("#pCover").innerHTML = coverHTML(it); $("#pCover").classList.toggle("station", it.source === "radio");
  $("#pTitle").textContent = it.title; $("#pSub").textContent = it.subtitle || "";
  P.icy = "";
  $("#bgArt").style.backgroundImage = it.art ? `url("${it.art.replace(/"/g, "")}")` : "none";
  $("#pBar").classList.toggle("live-bar", !!it.live);
  $("#pDur").innerHTML = it.live ? '<span class="live">LIVE</span>' : fmt(it.duration);
  $("#pCur").textContent = it.live ? "LIVE" : "0:00";
  $("#pCur").style.visibility = it.live ? "hidden" : "visible";
  $("#pFill").style.width = it.live ? "100%" : "0";
  updateFavBtn();
  document.title = `${it.title} — QASSIMZ Music`;
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: it.title, artist: it.subtitle || "", album: "QASSIMZ Music", artwork: it.art ? [{ src: it.art, sizes: "512x512" }] : [] });
  }
  const f = $(".full"); if (f) renderFull();
}
function updateFavBtn() { $("#pFav").innerHTML = P.cur && S.favs.has(keyOf(P.cur)) ? icoF("heart") : ico("heart"); $("#pFav").classList.toggle("on", !!(P.cur && S.favs.has(keyOf(P.cur)))); }
function markPlaying() {
  const k = P.cur && keyOf(P.cur);
  $$(".card, .tr").forEach((el) => {
    const on = !!(k && el.dataset.k === k); el.classList.toggle("playing", on);
    if (el.classList.contains("tr")) { const n = $(".n", el); if (n) n.innerHTML = on ? '<span class="eqbars"><i></i><i></i><i></i></span>' : (n.dataset.n || ""); }
  });
}
function updateModes() {
  $("#pShuffle").classList.toggle("on", P.shuffle);
  $("#pRepeat").classList.toggle("on", P.repeat !== "off");
  $("#pRepeat").title = { off: "تكرار (R)", all: "تكرار الكل (R)", one: "تكرار الأغنية (R)" }[P.repeat];
  $("#pRepeat").innerHTML = ico("repeat") + (P.repeat === "one" ? '<b style="position:absolute;font-size:9px;margin-top:2px">1</b>' : "");
}

/* ---------- YouTube (official embedded player, kept visible) */
function loadYTApi() { return new Promise((res) => { if (window.YT && YT.Player) return res(); window.onYouTubeIframeAPIReady = res; const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s); }); }
async function playYT(it) {
  let box = $("#ytBox");
  if (!box) {
    box = document.createElement("div"); box.id = "ytBox"; box.className = "yt-box";
    box.innerHTML = `<div class="yt-h"><span>${ico("yt")} YouTube</span><button class="ib" id="ytOpen" title="افتح على يوتيوب" style="width:26px;height:26px">${ico("open")}</button></div><div id="yt"></div>`;
    document.body.appendChild(box); P.yt = null; P.ytReady = false;
  }
  $("#ytOpen").onclick = () => api("open_url", { url: it.permalink });
  await loadYTApi();
  if (P.yt && P.ytReady) { P.yt.loadVideoById(it.id); P.yt.setVolume(Math.round(audio.volume * 100)); return; }
  P.yt = new YT.Player("yt", {
    videoId: it.id, width: 360, height: 203, host: "https://www.youtube.com",
    playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
    events: {
      onReady: (e) => { P.ytReady = true; e.target.setVolume(Math.round(audio.volume * 100)); e.target.playVideo(); },
      onStateChange: (e) => { if (e.data === 1) { setPlaying(true); const d = P.yt.getDuration(); if (d) { P.cur.duration = d; $("#pDur").textContent = fmt(d); } } else if (e.data === 2) setPlaying(false); else if (e.data === 0) (P.repeat === "one" ? P.yt.seekTo(0) : next()); },
      onError: () => { toast("الفيديو ده مش متاح للتشغيل جوه البرامج — بنقلك على اللي بعده", true); setTimeout(() => next(true), 1200); },
    },
  });
}

/* ---------- progress loop + visualizer (demand-driven rAF + cached gradients) */
function curTime() { return P.cur?.source === "youtube" ? (P.ytReady ? P.yt.getCurrentTime() : 0) : audio.currentTime; }
function durTime() { return P.cur?.source === "youtube" ? (P.ytReady ? P.yt.getDuration() : 0) : (isFinite(audio.duration) ? audio.duration : P.cur?.duration || 0); }
const freq = new Uint8Array(256);
let fakePhase = 0;
let rafId = 0;
const gradCache = new WeakMap();

function getMiniGrad(mc, g) {
  let cached = gradCache.get(mc);
  if (!cached || cached.h !== mc.height) {
    const grad = g.createLinearGradient(0, mc.height, 0, 0);
    grad.addColorStop(0, "#D97706");
    grad.addColorStop(0.55, "#F59E0B");
    grad.addColorStop(1, "#FDE68A");
    cached = { grad, h: mc.height };
    gradCache.set(mc, cached);
  }
  return cached.grad;
}

function getRingGrad(c, g) {
  let cached = gradCache.get(c);
  if (!cached || cached.w !== c.width || cached.h !== c.height) {
    const grad = g.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, "#FDE68A");
    grad.addColorStop(0.5, "#F59E0B");
    grad.addColorStop(1, "#D97706");
    cached = { grad, w: c.width, h: c.height };
    gradCache.set(c, cached);
  }
  return cached.grad;
}

function spectrum() {
  if (analyser && P.cur && P.cur.source !== "youtube") { analyser.getByteFrequencyData(freq); return freq; }
  fakePhase += P.playing ? 0.06 : 0; // YouTube is cross-origin: gentle synthetic motion
  for (let i = 0; i < 256; i++) freq[i] = P.playing ? 90 + 70 * Math.abs(Math.sin(fakePhase + i * 0.21)) * Math.abs(Math.cos(fakePhase * 0.7 + i * 0.05)) : 0;
  return freq;
}

function shouldRunLoop() {
  return !document.hidden && (P.playing || (!audio.paused && !!audio.src) || P.sleepAt > 0);
}

function startLoop() {
  if (!rafId && shouldRunLoop()) {
    rafId = requestAnimationFrame(loop);
  }
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function drawIdleVisuals() {
  const mc = $("#miniVis");
  if (mc) {
    const g = mc.getContext("2d");
    g.clearRect(0, 0, mc.width, mc.height);
    if (S.info?.settings.visualizer !== false) {
      const n = 20, w = mc.width / n;
      g.fillStyle = getMiniGrad(mc, g);
      for (let i = 0; i < n; i++) {
        g.beginPath();
        g.roundRect(i * w + 2, mc.height - 3, w - 4, 3, 2);
        g.fill();
      }
    }
  }
  const fc = $("#fVis");
  if (fc) {
    freq.fill(0);
    drawRing(fc, freq);
  }
}

function loop() {
  rafId = 0;
  if (!shouldRunLoop()) {
    if (!P.playing && !P.sleepAt) drawIdleVisuals();
    return;
  }
  if (P.cur && !P.cur.live) {
    const c = curTime(), d = durTime();
    $("#pCur").textContent = fmt(c); $("#pDur").textContent = fmt(d);
    $("#pFill").style.width = d ? Math.min(100, (c / d) * 100) + "%" : "0";
  }
  if (P.sleepAt) {
    const left = P.sleepAt - Date.now();
    if (left <= 0) { P.sleepAt = 0; $("#sleepBadge").textContent = ""; stopAll(); audio.volume = S.vol; setPlaying(false); toast("تصبح على خير"); }
    else { $("#sleepBadge").textContent = fmt(left / 1000); if (left < 20000) audio.volume = S.vol * (left / 20000); }
  }
  if (P.playing && S.info?.settings.visualizer !== false) {
    const f = spectrum();
    const mc = $("#miniVis");
    if (mc) {
      const g = mc.getContext("2d");
      g.clearRect(0, 0, mc.width, mc.height);
      const n = 20, w = mc.width / n;
      g.fillStyle = getMiniGrad(mc, g);
      for (let i = 0; i < n; i++) {
        const v = f[Math.floor(i * 5 + 2)] / 255, h = Math.max(3, v * mc.height);
        g.beginPath();
        g.roundRect(i * w + 2, mc.height - h, w - 4, h, 3);
        g.fill();
      }
    }
    const fc = $("#fVis");
    if (fc) drawRing(fc, f);
  }
  if (shouldRunLoop()) {
    rafId = requestAnimationFrame(loop);
  }
}

function drawRing(c, f) {
  const g = c.getContext("2d"), W = c.width, H = c.height, cx = W / 2, cy = H / 2, R = W * 0.29;
  g.clearRect(0, 0, W, H);
  g.strokeStyle = getRingGrad(c, g);
  g.lineCap = "round";
  g.lineWidth = Math.max(2, W / 110);
  const N = 84;
  g.beginPath();
  for (let i = 0; i < N; i++) {
    const k = i < N / 2 ? i : N - i;
    const v = f[Math.floor(4 + k * 2.4)] / 255;
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const h = W * 0.02 + v * W * 0.16;
    const cos = Math.cos(a), sin = Math.sin(a);
    g.moveTo(cx + R * cos, cy + R * sin);
    g.lineTo(cx + (R + h) * cos, cy + (R + h) * sin);
  }
  g.stroke();
}

/* ---------- fullscreen now playing */
function openFull() {
  if (!P.cur) return;
  if ($(".full")) return closeFull();
  const f = document.createElement("div"); f.className = "full" + (P.playing ? "" : " paused");
  document.body.appendChild(f); renderFull();
  if (P.playing) startLoop(); else drawIdleVisuals();
}
function closeFull() { $(".full")?.remove(); }
function renderFull() {
  const f = $(".full"), it = P.cur; if (!f || !it) return;
  f.innerHTML = `<div class="stage"><button class="ib close" id="fClose" title="رجوع (Esc)">${ico("x")}</button>
      <div class="ring-wrap"><canvas id="fVis" width="560" height="560"></canvas><div class="disc ${it.source === "youtube" ? "" : "spin"}">${coverHTML(it)}</div></div>
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;max-width:90%">${it.live ? '<span class="live">LIVE</span>' : ""}<h1>${esc(it.title)}</h1><div class="muted">${esc(it.subtitle || "")}</div><div class="icy" id="fIcy">${P.icy ? "♪ " + esc(P.icy) : ""}</div></div>
      <div class="btns"><button class="ib ${P.shuffle ? "on" : ""}" id="fShuf">${ico("shuffle")}</button><button class="ib" id="fPrev">${icoF("prev")}</button><button class="ib big" id="fPlay">${P.playing ? icoF("pause") : icoF("play")}</button><button class="ib" id="fNext">${icoF("next")}</button><button class="ib ${S.favs.has(keyOf(it)) ? "on" : ""}" id="fFav">${S.favs.has(keyOf(it)) ? icoF("heart") : ico("heart")}</button></div></div>
    <div class="glass queue"><h3>التالي في الانتظار</h3>${P.queue.slice(P.idx + 1, P.idx + 30).map((q, j) => `<div class="tr" data-q="${P.idx + 1 + j}" style="grid-template-columns:44px minmax(0,1fr) auto"><div class="art">${q.art ? `<img src="${esc(q.art)}" onerror="this.remove()">` : ico("disc")}</div><div style="min-width:0"><div class="tt">${esc(q.title)}</div><div class="ss">${esc(q.subtitle || "")}</div></div><span class="d">${q.live ? '<span class="live">LIVE</span>' : fmt(q.duration)}</span></div>`).join("") || '<p class="muted">مفيش حاجة في الانتظار</p>'}</div>`;
  $("#fClose", f).onclick = closeFull; $("#fPlay", f).onclick = togglePlay; $("#fNext", f).onclick = () => next(); $("#fPrev", f).onclick = prev;
  $("#fShuf", f).onclick = () => { P.shuffle = !P.shuffle; P.order = null; updateModes(); renderFull(); };
  $("#fFav", f).onclick = async () => { await toggleFav(it); renderFull(); };
  $$("[data-q]", f).forEach((r) => (r.onclick = () => { P.idx = +r.dataset.q; playCurrent(); }));
}

/* ---------- panels: queue / EQ / sleep */
function togglePanel(id, html, wire) {
  const ex = $("#" + id); $$(".panel").forEach((p) => p.remove()); if (ex) return;
  const p = document.createElement("div"); p.id = id; p.className = "panel glass"; p.innerHTML = html(); document.body.appendChild(p); wire && wire(p);
  setTimeout(() => document.addEventListener("mousedown", function o(e) { if (!p.contains(e.target) && !e.target.closest(".side-ctrl")) { p.remove(); document.removeEventListener("mousedown", o); } }), 0);
}
function renderQueue() {
  const p = $("#qPanel"); if (!p) return;
  p.innerHTML = queueHTML(); wireQueue(p);
}
const queueHTML = () => `<div class="sec-h" style="padding:0"><h3>${ico("queue")} قايمة الانتظار</h3>${P.queue.length ? `<button class="btn sm ghost" id="qClr">${ico("trash")}امسح</button>` : ""}</div>
  ${P.queue.length ? P.queue.map((q, i) => `<div class="tr ${i === P.idx ? "playing" : ""}" data-q="${i}" style="grid-template-columns:42px minmax(0,1fr) auto"><div class="art">${q.art ? `<img src="${esc(q.art)}" onerror="this.remove()">` : ico(q.live ? "radio" : "disc")}</div><div style="min-width:0"><div class="tt">${esc(q.title)}</div><div class="ss">${esc(q.subtitle || "")}</div></div><button class="ib" data-rmq="${i}" style="width:30px;height:30px">${ico("x")}</button></div>`).join("") : '<p class="muted">فاضية</p>'}`;
function wireQueue(p) {
  $$("[data-q]", p).forEach((r) => (r.onclick = (e) => { if (e.target.closest("[data-rmq]")) return; P.idx = +r.dataset.q; playCurrent(); }));
  $$("[data-rmq]", p).forEach((b) => (b.onclick = () => {
    const i = +b.dataset.rmq;
    const wasCurrent = i === P.idx;
    P.queue.splice(i, 1);
    P.order = null;
    if (!P.queue.length) {
      P.idx = -1;
      P.cur = null;
      clearInterval(P.npTimer);
      stopAll();
      setPlaying(false);
      $("#ytBox")?.remove();
      resetPlayerBar();
      markPlaying();
      renderQueue();
      return;
    }
    if (i < P.idx) {
      P.idx--;
    } else if (wasCurrent) {
      if (P.idx >= P.queue.length) P.idx = 0;
      if (P.playing) {
        playCurrent();
        return;
      }
      P.cur = P.queue[P.idx];
      updateNowPlaying();
      markPlaying();
    }
    renderQueue();
  }));
  const c = $("#qClr", p);
  if (c) c.onclick = () => { P.queue = P.cur ? [P.cur] : []; P.idx = P.cur ? 0 : -1; P.order = null; renderQueue(); };
}
const EQ_AR = { flat: "عادي", shaabi: "شعبي", mahraganat: "مهرجانات", tarab: "طرب", vocal: "صوت", rock: "روك", electronic: "إلكتروني", jazz: "جاز", classical: "كلاسيك", bass: "باص", custom: "مخصص" };
function eqPanel() {
  togglePanel("eqPanel", () => {
    const st = S.info.settings, vals = eqValues();
    return `<h3>${ico("eq")} الإكولايزر (10-Band EQ)</h3><div class="chips">${[...Object.keys(S.info.eq_presets), "custom"].map((k) => `<button class="chip ${st.eq === k ? "on" : ""}" data-p="${k}">${EQ_AR[k] || k}</button>`).join("")}</div>
      <div class="eq">${S.info.eq_bands.map((b, i) => `<div class="band"><input type="range" min="-12" max="12" step="1" value="${vals[i]}" data-b="${i}"><small>${b >= 1000 ? b / 1000 + "k" : b}</small></div>`).join("")}</div>
      <p class="muted" style="font-size:12px;margin-top:8px">${P.cur?.source === "youtube" ? "الإكولايزر مش بيأثر على يوتيوب (المشغّل بتاعهم)." : "الإكولايزر شغّال على الراديو والأغاني وملفاتك."}</p>`;
  }, (p) => {
    $$("[data-p]", p).forEach((c) => (c.onclick = () => { S.info.settings.eq = c.dataset.p; api("save_settings", { values: { eq: c.dataset.p } }); applyEQ(eqValues()); $$("[data-p]", p).forEach((x) => x.classList.toggle("on", x === c)); $$("[data-b]", p).forEach((r, i) => (r.value = eqValues()[i])); }));
    $$("[data-b]", p).forEach((r) => (r.oninput = () => {
      const vals = $$("[data-b]", p).map((x) => +x.value); S.info.settings.eq = "custom"; S.info.settings.eq_custom = vals; applyEQ(vals);
      $$("[data-p]", p).forEach((x) => x.classList.toggle("on", x.dataset.p === "custom"));
      saveSettingsDebounced({ eq: "custom", eq_custom: vals });
    }));
  });
}
function sleepMenu(btn) {
  menu(btn, [...[15, 30, 45, 60, 90].map((m) => ({ label: `بعد ${m} دقيقة`, icon: "moon", do: () => { P.sleepAt = Date.now() + m * 60000; startLoop(); toast(`هيقف بعد ${m} دقيقة`); } })),
    "-", { label: "آخر الأغنية دي", icon: "moon", do: () => { const left = durTime() - curTime(); if (!P.cur || P.cur.live || !left) return toast("مينفعش مع الراديو اللايف", true); P.sleepAt = Date.now() + left * 1000; startLoop(); } },
    { label: "الغِ المؤقت", icon: "x", do: () => { P.sleepAt = 0; $("#sleepBadge").textContent = ""; audio.volume = S.vol; if (!P.playing) stopLoop(); } }]);
}

/* ================================================================== SETTINGS */
async function openSettings() {
  const st = S.info.settings;
  const m = modal(`<div class="modal-h"><h2>الإعدادات</h2><button class="ib" data-close>${ico("x")}</button></div>
    <h3>${ico("radio")} الراديو</h3>
    <label class="f">إذاعات البلد في الرئيسية<select class="sel" id="sCountry"><option value="EG">مصر</option></select></label>
    <hr class="sep"><h3>${ico("yt")} يوتيوب (اختياري — مجاني)</h3>
    <p class="muted" style="font-size:13px;line-height:1.9">عشان تلاقي الأغاني المشهورة نفسها (مهرجانات، شعبي، أجنبي…). اعمل مفتاح مجاني من <a href="#" data-url="https://console.cloud.google.com/apis/library/youtube.googleapis.com">Google Cloud</a> ← فعّل <b>YouTube Data API v3</b> ← Credentials ← <b>Create API key</b> والصقه هنا. التشغيل بيكون من مشغّل يوتيوب الرسمي.</p>
    <input class="in" id="sYT" type="password" dir="ltr" placeholder="${st.has_youtube ? "محفوظ ✓ — اكتب جديد لو عايز تغيّره" : "AIza…"}">
    <hr class="sep"><h3>Audius</h3>
    <p class="muted" style="font-size:13px">شغّال من غير مفتاح. لو Audius طلب مفتاح في يوم، اعمله من <a href="#" data-url="https://audius.co/settings">إعدادات Audius</a> والصقه هنا.</p>
    <input class="in" id="sAud" type="password" dir="ltr" placeholder="${st.has_audius_key ? "محفوظ ✓" : "اختياري"}">
    <hr class="sep"><h3>${ico("lib")} أغانيّ على الجهاز</h3>
    <div class="chips" id="sDirs">${(st.music_dirs || []).map((d) => `<span class="chip" dir="ltr">${esc(d)} <button class="ib" data-rmd="${esc(d)}" style="width:22px;height:22px">${ico("x")}</button></span>`).join("")}</div>
    <div><button class="btn sm" id="sAddDir">${ico("folder")}ضيف فولدر</button></div>
    <hr class="sep">
    <label class="tog"><span>مؤشر الطيف الصوتي (Visualizer)</span><input type="checkbox" id="sVis" ${st.visualizer !== false ? "checked" : ""}><span class="sw"></span></label>
    <label class="tog"><span>تحديث تلقائي من QASSIMZ Hub / GitHub</span><input type="checkbox" id="sUpd" ${st.auto_update !== false ? "checked" : ""}><span class="sw"></span></label>
    <div class="chips"><button class="btn sm" id="sChk">ابحث عن تحديث</button><button class="btn sm" id="sGit">${ico("github")}GitHub</button><button class="btn sm" id="sSup">${ico("heart")}الدعم</button>
      <span class="muted" style="font-size:12.5px;align-self:center">الإصدار ${S.info.version} · من أحمد قاسم — قَاسِمز</span></div>
    <p class="muted" style="font-size:12px;line-height:1.8">المصادر: Radio Browser (دليل محطات مفتوح)، Audius، Internet Archive، YouTube. كل الحقوق لأصحابها، والبرنامج بيشغّل من المصادر الرسمية بس.</p>
    <div class="modal-f"><button class="btn gold" id="sSave">حفظ</button><button class="btn ghost" data-close>إلغاء</button></div>`, true);
  api("radio_countries").then((cs) => { if (!$("#sCountry", m)) return; $("#sCountry", m).innerHTML = cs.map((c) => `<option value="${esc(c.code)}">${esc(c.name)}</option>`).join(""); $("#sCountry", m).value = st.country || "EG"; }).catch(() => {});
  $$("[data-url]", m).forEach((a) => (a.onclick = (e) => { e.preventDefault(); api("open_url", { url: a.dataset.url }); }));
  $$("[data-rmd]", m).forEach((b) => (b.onclick = async () => { S.info.settings.music_dirs = await api("remove_music_dir", { path: b.dataset.rmd }); b.closest(".chip").remove(); }));
  $("#sAddDir", m).onclick = async () => { if (!S.info.native) return toast("متاحة من البرنامج المتسطب", true); S.info.settings.music_dirs = await api("add_music_dir"); m.close(); openSettings(); };
  $("#sGit", m).onclick = () => api("open_url", { url: S.info.github });
  $("#sSup", m).onclick = () => api("open_url", { url: S.info.support });
  $("#sChk", m).onclick = async () => { const r = await api("check_update"); r.version ? updateBanner(r) : toast(r.latest ? "✓ عندك أحدث إصدار" : "مقدرتش أوصل للتحديثات"); };
  $("#sSave", m).onclick = async () => {
    const v = { country: $("#sCountry", m).value, visualizer: $("#sVis", m).checked, auto_update: $("#sUpd", m).checked };
    if ($("#sYT", m).value.trim()) v.youtube_key = $("#sYT", m).value.trim();
    if ($("#sAud", m).value.trim()) v.audius_key = $("#sAud", m).value.trim();
    await api("save_settings", { values: v }); S.info = await api("info"); S.countryName = $("#sCountry", m).selectedOptions[0]?.textContent;
    m.close(); toast("✓ اتحفظت"); render();
  };
}
function updateBanner(u) {
  if ($("#updB")) return;
  const d = document.createElement("div"); d.id = "updB"; d.className = "toast"; d.style.top = "74px"; d.style.bottom = "auto";
  d.innerHTML = `إصدار جديد ${esc(u.version)} متاح <button class="btn sm gold" style="margin-inline-start:10px">حدّث دلوقتي</button>`;
  document.body.appendChild(d); $("button", d).onclick = () => api("install_update");
}

function focusOrOpenSearch() {
  if ($(".full")) closeFull();
  $$(".modal").forEach((m) => (m.close ? m.close() : m.remove()));
  const inp = $("#sQ") || $("#rQ") || $("#lQ") || $("#topSearch") || $("#hQ");
  if (S.route.v === "search" && $("#sQ")) {
    $("#sQ").focus();
    $("#sQ").select();
    return;
  }
  if (inp && (S.route.v === "radio" || S.route.v === "library")) {
    inp.focus();
    inp.select();
    return;
  }
  if ($("#topSearch")) {
    $("#topSearch").focus();
    $("#topSearch").select();
    return;
  }
  go("search");
  setTimeout(() => { const sq = $("#sQ"); if (sq) { sq.focus(); sq.select(); } }, 30);
}

/* ================================================================== boot */
async function boot() {
  try { window.focus(); } catch (e) {}
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("input, textarea, select, [contenteditable='true']")) {
      try { window.focus(); } catch (err) {}
    }
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  // Wire integrated frameless Liquid Glass topbar controls
  $("#winMin")?.addEventListener("click", () => api("win_minimize").catch(() => {}));
  $("#winMax")?.addEventListener("click", () => api("win_toggle_maximize").catch(() => {}));
  $("#winClose")?.addEventListener("click", () => api("win_close").catch(() => {}));
  $("#appTopbar")?.addEventListener("dblclick", (e) => {
    if (e.target.closest(".no-drag, button, input")) return;
    api("win_toggle_maximize").catch(() => {});
  });
  $("#topBack")?.addEventListener("click", () => history_back());
  $("#topSearch")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = e.currentTarget.value.trim();
      if (q) go("search", q);
    }
  });

  S.info = await api("info");
  S.favs = new Set(S.info.favs);
  S.vol = S.info.settings.volume ?? 0.8; audio.volume = S.vol; $("#pVol").value = S.vol;
  await refreshPlaylists();
  const set = (id, i, f) => { $(id).innerHTML = f ? icoF(i) : ico(i); };
  set("#pPlay", "play", 1); set("#pNext", "next", 1); set("#pPrev", "prev", 1); set("#pShuffle", "shuffle"); set("#pFav", "heart"); set("#pSleep", "moon"); set("#pEq", "eq"); set("#pQueue", "queue"); set("#pMute", "vol"); set("#pFull", "full");
  set("#bSet", "settings"); set("#bGit", "github"); set("#bSup", "heart"); set("#newPl", "plus"); updateModes();
  $("#pPlay").onclick = togglePlay; $("#pNext").onclick = () => next(); $("#pPrev").onclick = prev;
  $("#pShuffle").onclick = () => { P.shuffle = !P.shuffle; P.order = null; updateModes(); };
  $("#pRepeat").onclick = () => { P.repeat = { off: "all", all: "one", one: "off" }[P.repeat]; updateModes(); };
  $("#pFav").onclick = () => P.cur && toggleFav(P.cur);
  $("#pCover").onclick = openFull; $("#pFull").onclick = openFull;
  $("#pQueue").onclick = () => togglePanel("qPanel", queueHTML, wireQueue);
  $("#pEq").onclick = eqPanel; $("#pSleep").onclick = (e) => sleepMenu(e.currentTarget);
  const saveVol = debounce((v) => api("save_settings", { values: { volume: v } }), 600);
  const applyVol = (v) => {
    S.vol = Math.max(0, Math.min(1, +v.toFixed(2)));
    $("#pVol").value = S.vol;
    audio.muted = false;
    audio.volume = S.vol;
    if (P.ytReady) { P.yt.unMute(); P.yt.setVolume(Math.round(S.vol * 100)); }
    $("#pMute").innerHTML = ico(S.vol ? "vol" : "mute");
    saveVol(S.vol);
  };
  $("#pVol").oninput = (e) => applyVol(+e.target.value);
  $("#pMute").onclick = () => { audio.muted = !audio.muted; if (P.ytReady) audio.muted ? P.yt.mute() : P.yt.unMute(); $("#pMute").innerHTML = ico(audio.muted ? "mute" : "vol"); };
  $("#pBar").onclick = (e) => { if (!P.cur || P.cur.live) return; const r = e.currentTarget.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), d = durTime(); if (!d) return; P.cur.source === "youtube" ? P.yt.seekTo(d * x, true) : (audio.currentTime = d * x); };
  $("#newPl").onclick = async () => { const n = prompt("اسم القايمة:"); if (n) { const id = await api("playlist_create", { name: n }); await refreshPlaylists(); go("playlist", id); } };
  $("#bSet").onclick = openSettings; $("#bGit").onclick = () => api("open_url", { url: S.info.github }); $("#bSup").onclick = () => api("open_url", { url: S.info.support });
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", togglePlay); navigator.mediaSession.setActionHandler("pause", togglePlay);
    navigator.mediaSession.setActionHandler("nexttrack", () => next()); navigator.mediaSession.setActionHandler("previoustrack", prev);
  }

  /* Universal layout-independent keyboard shortcuts (Arabic & English via e.code) */
  document.addEventListener("keydown", (e) => {
    const code = e.code;
    const mod = e.ctrlKey || e.metaKey;
    const active = document.activeElement;
    const inInput = !!(active && active.matches("input, textarea, select, [contenteditable='true']"));

    if (code === "Escape") {
      if ($(".menu")) { e.preventDefault(); closeMenus(); return; }
      const modals = $$(".modal");
      if (modals.length) { e.preventDefault(); const top = modals[modals.length - 1]; top.close ? top.close() : top.remove(); return; }
      if ($(".panel")) { e.preventDefault(); $$(".panel").forEach((p) => p.remove()); return; }
      if ($(".full")) { e.preventDefault(); closeFull(); return; }
      if (inInput) { e.preventDefault(); active.blur(); return; }
      return;
    }

    if (code === "F11") {
      e.preventDefault();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen?.().catch(() => {});
      return;
    }

    if (mod && code === "Comma") {
      e.preventDefault();
      if (!$(".modal")) openSettings();
      return;
    }

    if (mod && (code === "KeyF" || code === "KeyK")) {
      e.preventDefault();
      focusOrOpenSearch();
      return;
    }

    const digitMatch = /^Digit([1-6])$/.exec(code);
    if (digitMatch && (e.altKey || (!inInput && !mod))) {
      e.preventDefault();
      const target = NAV[+digitMatch[1] - 1];
      if (target) { closeFull(); go(target[0]); }
      return;
    }

    if (inInput) return;

    if (code === "Space") {
      if (e.target && e.target.closest("button, a, [role='button']")) return;
      e.preventDefault();
      togglePlay();
    } else if (!mod && !e.altKey && code === "Slash") {
      e.preventDefault();
      focusOrOpenSearch();
    } else if (!mod && !e.altKey && code === "KeyM") {
      e.preventDefault();
      $("#pMute").click();
    } else if (!mod && !e.altKey && code === "KeyF") {
      e.preventDefault();
      openFull();
    } else if (code === "ArrowUp") {
      e.preventDefault();
      applyVol(S.vol + 0.05);
    } else if (code === "ArrowDown") {
      e.preventDefault();
      applyVol(S.vol - 0.05);
    } else if ((mod && code === "ArrowLeft") || (!mod && !e.altKey && code === "KeyN")) {
      e.preventDefault();
      next();
    } else if ((mod && code === "ArrowRight") || (!mod && !e.altKey && code === "KeyP")) {
      e.preventDefault();
      prev();
    } else if (!mod && !e.altKey && (code === "ArrowLeft" || code === "ArrowRight")) {
      if (P.cur && !P.cur.live) {
        e.preventDefault();
        const d = durTime(), c = curTime();
        if (d > 0) {
          const target = Math.max(0, Math.min(d, c + (code === "ArrowRight" ? 5 : -5)));
          if (P.cur.source === "youtube" && P.ytReady) P.yt.seekTo(target, true);
          else audio.currentTime = target;
        }
      }
    } else if (!mod && !e.altKey && code === "KeyS") {
      e.preventDefault();
      $("#pShuffle").click();
    } else if (!mod && !e.altKey && code === "KeyR") {
      e.preventDefault();
      $("#pRepeat").click();
    } else if (!mod && !e.altKey && code === "KeyQ") {
      e.preventDefault();
      $("#pQueue").click();
    } else if (!mod && !e.altKey && code === "KeyE") {
      e.preventDefault();
      eqPanel();
    } else if (!mod && code === "Backspace") {
      e.preventDefault();
      history_back();
    }
  });

  api("radio_countries").then((cs) => { S.countryName = cs.find((c) => c.code === (S.info.settings.country || "EG"))?.name; }).catch(() => {});
  render();
  drawIdleVisuals();
  setTimeout(async () => { const i = await api("info"); if (i.update) updateBanner(i.update); }, 9000);
}
document.fonts.ready.then(boot);
