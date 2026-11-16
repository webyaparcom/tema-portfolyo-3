/* ust-bolunmus — Üst Bölünmüş — ortada logo, iki yanda menü (15 Kas 2026 · mcp:webmaker/20261115-224259-bpa9 · D17).
   Logo tam ortada; menü öğeleri ikiye bölünüp logonun iki yanına dizilir, düğme ve dil seçici sağ kanadın ucunda. Dar ekranda logo + menü düğmesi, açılır liste.
   Üretici: scripts/modul-fabrika (aile menu) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: Öğeler: Anasayfa + site sayfaları (pagesetting; yayında, kategorisiz; `maxpages` > 0 ise sınır) + data [{ name|ad, url|href }] ek bağlantılar. desing: cta_ad · cta_url (menu-10 `cta`) · tel/eposta (yoksa site ayarı). */
const P = "modulex-ust-bolunmus";
const IMG_KOK = "/img/";
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: menu --- */
/* öğeler: @home@ + pagesetting sayfaları (yayında, kategorisiz) + data ek bağlantıları (menu-10 ile aynı sıra) */
const sayfa = page || {};
let maks = parseInt(des.maxpages, 10);
if (!Number.isFinite(maks)) maks = 0;
const ps = Array.isArray(webmakerdata?.pagesetting?.data) ? webmakerdata.pagesetting.data.find((it) => it?.modulestatus?.page) : null;
const sSatir = ps && Array.isArray(webmakerdata?.[ps.path]?.data) ? webmakerdata[ps.path].data : [];
const kayitlar = [{ ad: "@home@", url: wxLangInternalHref(""), aktif: !sayfa.path, dis: false }];
for (const r of sSatir) {
  if (maks > 0 && kayitlar.length > maks) break;
  if (!r || r.status !== "play" || (r.category || "") !== "") continue;
  const a = pick(r.name).trim();
  if (a) kayitlar.push({ ad: a, url: wxLangInternalHref(r.pathnext || r.path || ""), aktif: !!sayfa.path && sayfa.path === r.path, dis: false });
}
veri.forEach((o) => {
  const a = metinAl(o, ["ad", "name", "text", "baslik", "title"]);
  const u = href(ilk(o, ["url", "href", "link"]));
  if (a && u) kayitlar.push({ ad: a, url: u, aktif: false, dis: /^(https?:)?\/\//i.test(u) });
});
const ctaAd = metinAl(des, ["cta_ad", "cta", "button"]);
const ctaUrl = href(ilk(des, ["cta_url", "buttonurl"]));
const tel = metinAl(des, ["tel", "phone", "telefon"]) || (typeof setting.phone === "string" ? setting.phone.trim() : "");
const posta = metinAl(des, ["eposta", "email"]) || (typeof setting.email === "string" ? setting.email.trim() : "");
/* --- parça üreticileri --- */
const bagA = (k, s) => `<a class="${P}-${s || "oge"}" href="${esc(k.url)}"${k.aktif ? ' aria-current="page"' : ""}${k.dis ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(k.ad)}</a>`;
const navH = (s, dizi, oge) => `<ul class="${P}-${s || "liste"}">${(dizi || kayitlar).map((k) => `<li>${bagA(k, oge)}</li>`).join("")}</ul>`;
const logoH = (s) => `<a class="${P}-${s || "logo"}" href="/{{lang}}/" aria-label="@home@ - {{web-name}}">${String(setting.logo || "").trim() ? `<img src="/img/{{logo}}" alt="{{web-name}}" loading="eager" decoding="async" />` : `<span class="${P}-ad">{{web-name}}</span>`}</a>`;
const ctaH = (s) => (ctaAd && ctaUrl ? `<a class="${P}-${s || "cta"}" href="${esc(ctaUrl)}">${esc(ctaAd)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
const telH = (s) => (tel ? `<a class="${P}-${s || "tel"}" href="tel:${esc(tel.replace(/[^+\d]/g, ""))}"><span class="material-symbols-outlined" aria-hidden="true">call</span><bdi dir="ltr">${esc(tel)}</bdi></a>` : "");
const postaH = (s) => (posta ? `<a class="${P}-${s || "posta"}" href="mailto:${esc(posta)}"><span class="material-symbols-outlined" aria-hidden="true">mail</span><bdi dir="ltr">${esc(posta)}</bdi></a>` : "");
const dilH = (s) => `<div class="${P}-${s || "dil"}">{{langbar}}</div>`;
/* aç düğmesi: data-genis → o genişlikte (ve üstünde) açık panel kendiliğinden kapanır; yazili → «Menü» yazısı görünür */
const acH = (genis, yazili) => `<button type="button" class="${P}-ac" aria-expanded="false" aria-controls="${P}-{{id}}-panel" aria-label="@menu-toggle@"${genis ? ` data-genis="${genis}"` : ""}><span class="${P}-ac-ikon" aria-hidden="true"><span></span><span></span><span></span></span>${yazili ? `<span class="${P}-ac-yazi" aria-hidden="true">@menu@</span>` : ""}</button>`;
const kapatH = () => `<button type="button" class="${P}-kapat" aria-label="@menu-close@"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>`;
/* panel: modal → role=dialog + odak tuzağı + perde; açılır → sayfa akışına inen liste */
const panelH = (ic, modal) => `${modal ? `<div class="${P}-perde" hidden></div>` : ""}<div class="${P}-panel" id="${P}-{{id}}-panel"${modal ? ' role="dialog" aria-modal="true" aria-label="@menu@"' : ""} hidden>${ic}</div>`;
/* --- modül: ust-bolunmus --- */
const kart = function () { return ""; };
const sar = () => {
    const y = Math.ceil(kayitlar.length / 2);
    return `<div class="${P}-cubuk"><nav class="${P}-nav ${P}-nav--bas" aria-label="@navigation@">${navH("liste", kayitlar.slice(0, y))}</nav><div class="${P}-orta">${logoH()}</div><div class="${P}-kanat"><nav class="${P}-nav" aria-label="@navigation@">${navH("liste", kayitlar.slice(y))}</nav><div class="${P}-genis">${dilH()}${ctaH()}</div>${acH(1025)}</div></div>${panelH(`<nav aria-label="@navigation@">${navH("pliste")}</nav><div class="${P}-palt">${ctaH()}${dilH()}</div>`, false)}`;
  };
const B = { ust: metinAl(des, ["ust"]), baslik: metinAl(des, ["baslik"]), metin: metinAl(des, ["metin"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = false;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik && bas ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
