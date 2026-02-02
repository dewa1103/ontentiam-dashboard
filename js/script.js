const sheetId = "1mLHUXCursVGUr63zwVD3qw5HCaC5G7ot5TFWsumO1a8";

// KPI
const kpiSheet = "Sheets 1";
const kpiUrl = `https://opensheet.elk.sh/${sheetId}/${encodeURIComponent(kpiSheet)}`;

// PRODUCT
const productSheet = "TOP_10_PRODUCT";
const productUrl = `https://opensheet.elk.sh/${sheetId}/${encodeURIComponent(productSheet)}`;

let achievement = null;
let mtdSales = null;
let targetMtd = null;

/* ================= FETCH KPI ================= */
function fetchKPI() {
  fetch(kpiUrl)
    .then(res => res.json())
    .then(data => {
      achievement = null;
      mtdSales = null;
      targetMtd = null;

      data
        .filter(item => item.KEY && item.VALUE)
        .forEach(item => {
          const key = item.KEY;
          let val = Number(item.VALUE);
          const label = item.LABEL;

          // NORMALISASI ACHIEVEMENT
          if (key === "achievment") {
            if (val > 1) val = val / 100;
            achievement = val;
          }

          if (key === "mtd_sales") mtdSales = val;
          if (key === "target_mtd") targetMtd = val;

          renderSingle(key, val, label);
        });

      renderGapPerf();
      renderSalesVsTarget();
      buildInsight();
      updateLastUpdated();
    })
    .catch(err => console.error("KPI FETCH ERROR:", err));
}

/* ================= FETCH PRODUCT ================= */
function fetchProducts() {
  fetch(productUrl)
    .then(res => res.json())
    .then(data => renderTop10Products(data))
    .catch(err => {
      console.error("PRODUCT FETCH ERROR:", err);
      document.getElementById("top10-products").innerHTML =
        "<li>Data produk tidak tersedia</li>";
    });
}

/* ================= TOP 10 PRODUCT ================= */
function renderTop10Products(data) {
  const list = document.getElementById("top10-products");
  if (!list) return;

  list.innerHTML = "";

  const products = data
    .filter(p => p.PRODUCT && p.QTY && !isNaN(Number(p.QTY)))
    .map(p => ({ name: p.PRODUCT, qty: Number(p.QTY) }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  if (!products.length) {
    list.innerHTML = "<li>Data produk tidak tersedia</li>";
    return;
  }

  products.forEach(item => {
    const li = document.createElement("li");
    li.innerText = `${item.name} — ${item.qty}`;
    list.appendChild(li);
  });
}

/* ================= KPI HELPERS ================= */
function renderSingle(key, val, label) {
  set(`label-${key}`, label);
  const el = document.getElementById(key);
  if (!el) return;

  el.innerText = format(val, key);
  el.className = "";

  // achievement coloring
  if (key === "achievment") {
    if (val < 0.7) el.classList.add("danger");
    else if (val < 1) el.classList.add("warning");
    else el.classList.add("success");
  }

  // growth / decline coloring
  if (key === "sales_perf") {
    if (val < 0) el.classList.add("danger");
    else el.classList.add("success");
  }
}

/* ================= SALES VS TARGET ================= */
function renderSalesVsTarget() {
  if (mtdSales === null || targetMtd === null) return;

  const el = document.getElementById("mtd_sales");
  if (!el) return;

  el.classList.remove("danger", "success", "warning");

  if (mtdSales < targetMtd) el.classList.add("danger");
  else el.classList.add("success");
}

function renderGapPerf() {
  if (achievement === null) return;

  const gap = 1 - achievement;
  const el = document.getElementById("gap_perf");
  if (!el) return;

  el.innerText = (gap * 100).toFixed(2) + "%";
  el.className = gap > 0 ? "danger" : "success";
}

function buildInsight() {
  const box = document.getElementById("auto_insight");
  if (!box || achievement === null) return;

  const title = box.querySelector(".insight-title");
  const text = box.querySelector(".insight-text");
  const percent = achievement * 100;

  box.className = "insight";

  if (achievement >= 1) {
    box.classList.add("success");
    title.innerText = "Target Tercapai 🎉";
    text.innerText =
      "Performa bulan ini sangat baik. Pertahankan konsistensi operasional dan kualitas produk.";
  } else if (achievement >= 0.8) {
    box.classList.add("warning");
    title.innerText = "Mendekati Target";
    text.innerText =
      `Pencapaian ${percent.toFixed(1)}%. Dorong traffic dan optimalkan APC untuk menutup gap.`;
  } else {
    box.classList.add("danger");
    title.innerText = "Performa Perlu Ditingkatkan";
    text.innerText =
      `Baru tercapai ${percent.toFixed(1)}%. Perlu evaluasi traffic, APC, dan strategi harian.`;
  }
}

/* ================= FORMAT ================= */
function format(num, key) {
  if (["mtd_sales", "target_mtd", "apc_avg"].includes(key))
    return "Rp " + num.toLocaleString("id-ID");

  if (key === "traffic_avg")
    return Math.round(num).toLocaleString("id-ID");

  if (["achievment", "sales_perf"].includes(key))
    return (num * 100).toFixed(2) + "%";

  return num.toLocaleString("id-ID");
}

/* ================= DOM ================= */
function set(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = text;
}

/* ================= LAST UPDATED ================= */
function updateLastUpdated() {
  document.getElementById("lastUpdated").innerText =
    "Last updated: " + new Date().toLocaleString("id-ID");
}

/* ================= INIT ================= */
fetchKPI();
fetchProducts();
setInterval(() => {
  fetchKPI();
  fetchProducts();
}, 5 * 60 * 1000);
