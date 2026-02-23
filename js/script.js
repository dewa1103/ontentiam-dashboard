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
          if (key === "achievement") {
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
      buildPerformanceAlarm(data);
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
  const container = document.getElementById("top10-products");
  if (!container) return;

  container.innerHTML = "";

  const products = data
    .filter(p => p.PRODUCT && p.QTY && !isNaN(Number(p.QTY)))
    .map(p => ({
      name: p.PRODUCT,
      qty: Number(p.QTY)
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  if (!products.length) {
    container.innerHTML = "<div class='product-loading'>Data produk tidak tersedia</div>";
    return;
  }

  const maxQty = products[0].qty;

  products.forEach((item, index) => {
    const percent = (item.qty / maxQty) * 100;

    const row = document.createElement("div");
    row.className = "product-row";

    row.innerHTML = `
      <div class="product-rank">${index + 1}</div>

      <div class="product-info">
        <div class="product-name">${item.name}</div>
        <div class="product-bar">
          <span style="width:${percent}%"></span>
        </div>
      </div>

      <div class="product-qty">${item.qty}</div>
    `;

    container.appendChild(row);
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
  if (key === "achievement") {
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

  const el = document.getElementById("gap_perf");
  if (!el) return;

  if (achievement >= 1) {
    el.innerText = "0%";
    el.className = "success";
  } else {
    const gap = (1 - achievement) * 100;
    el.innerText = gap.toFixed(2) + "%";
    el.className = "danger";
  }
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
function buildPerformanceAlarm(data) {
  const ratioRaw = data.find(d => d.KEY === "pressure_ratio")?.VALUE;
  const forecastRaw = data.find(d => d.KEY === "forecast_end_month")?.VALUE;
  const targetRaw = data.find(d => d.KEY === "target_mtd")?.VALUE;

 if (!ratioRaw) return;


  const ratio = Number(ratioRaw);
  const forecast = Number(forecastRaw);
  const target = Number(targetRaw);

  const alarmBox = document.getElementById("performance_alarm");
  const statusEl = document.getElementById("alarm_status");
  const messageEl = document.getElementById("alarm_message");
  const barFill = document.getElementById("alarm_bar_fill");

  // RESET CLASS
  alarmBox.classList.remove("success", "warning", "danger");

  

  let color = "";
  let message = "";
// LOGIC BERDASARKAN RATIO
if (ratio <= 1) {
  color = "var(--success)";
  statusEl.innerText = "ON TRACK";
  message = "Momentum stabil. Target aman tercapai.";
  alarmBox.classList.add("success");
} 
else if (ratio <= 3) {
  color = "var(--warning)";
  statusEl.innerText = "HEAVY";
  message = "Tekanan meningkat. Perlu dorongan performa harian.";
  alarmBox.classList.add("warning");
} 
else {
  color = "var(--danger)";
  statusEl.innerText = "CRITICAL";
  message = "Kondisi kritis. Butuh akselerasi besar untuk mengejar target.";
  alarmBox.classList.add("danger");
}

  // Tambah info GAP ke target
  if (!isNaN(forecast) && !isNaN(target)) {
    const gap = target - forecast;
    if (gap > 0) {
      message += ` Gap ke target: Rp ${gap.toLocaleString("id-ID")}`;
    }
  }

  statusEl.style.color = color;
  barFill.style.background = color;

  const width = Math.min(ratio * 20, 100);
  barFill.style.width = width + "%";

  messageEl.innerText =
    `${ratio.toFixed(1)}x tekanan terhadap performa rata-rata saat ini. ${message}`;
}



/* ================= FORMAT ================= */
function format(num, key) {
  if (["mtd_sales", "target_mtd", "apc_avg"].includes(key))
    return "Rp " + num.toLocaleString("id-ID");

  if (key === "traffic_avg")
    return Math.round(num).toLocaleString("id-ID");

  if (["achievement", "sales_perf"].includes(key)) {
  const percent = (num * 100).toFixed(2);
  return (num > 0 ? "+" : "") + percent + "%";
}


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
/* ================= THEME TOGGLE ================= */
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

// load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  body.classList.add("light");
  toggleBtn.innerText = "🌙 Dark Mode";
} else {
  toggleBtn.innerText = "☀️ Light Mode";
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("light");

  const isLight = body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");

  toggleBtn.innerText = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
});
