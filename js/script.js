const sheetId = "1mLHUXCursVGUr63zwVD3qw5HCaC5G7ot5TFWsumO1a8";
const sheetName = "Sheets 1";
const url = `https://opensheet.elk.sh/${sheetId}/${encodeURIComponent(sheetName)}`;

let achievement = null;
let mtdSales = null;
let targetMtd = null;

/* ================= FETCH ================= */

fetch(url)
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      const key = item.KEY;
      const val = Number(item.VALUE);
      const label = item.LABEL;

      if (key === "achievment") achievement = val;
      if (key === "mtd_sales") mtdSales = val;
      if (key === "target_mtd") targetMtd = val;

      renderSingle(key, val, label);
    });

    renderGapPerf();
    buildInsight();
  })
  .catch(err => console.error("FETCH ERROR:", err));

/* ================= RENDER ================= */

function renderSingle(key, val, label) {
  set(`label-${key}`, label);
  set(key, format(val, key), key, val);
}

/* ================= GAP PERF ================= */

function renderGapPerf() {
  if (achievement === null) return;

  const gap = 1 - achievement;
  const el = document.getElementById("gap_perf");
  if (!el) return;

  el.innerText = (gap * 100).toFixed(2) + "%";
  el.classList.remove("danger", "success");
  el.classList.add(gap > 0 ? "danger" : "success");
}

/* ================= AUTO INSIGHT ================= */

function buildInsight() {
  const box = document.getElementById("auto_insight");
  if (!box || achievement === null) return;

  const title = box.querySelector(".insight-title");
  const text = box.querySelector(".insight-text");
  const percent = achievement * 100;

  box.classList.remove("success", "warning", "danger");

  if (achievement >= 1) {
    box.classList.add("success");
    title.innerText = "Target Tercapai 🎉";
    text.innerText =
      "Performa bulan ini sangat baik. Fokus ke konsistensi dan scaling.";
    return;
  }

  if (achievement >= 0.8) {
    box.classList.add("warning");
    title.innerText = "Mendekati Target";
    text.innerText =
      `Pencapaian ${percent.toFixed(1)}%. Dorong penjualan harian untuk menutup gap.`;
    return;
  }

  box.classList.add("danger");
  title.innerText = "Performa Perlu Ditingkatkan";
  text.innerText =
    `Baru tercapai ${percent.toFixed(1)}%. Perlu evaluasi traffic, APC, dan strategi harian.`;
}

/* ================= DOM HELPERS ================= */

function set(id, text, key, val) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerText = text;
  if (key) colorize(el, key, val);
}

function colorize(el, key, val) {
  el.classList.remove("danger", "warning", "success");

  if (key === "achievment") {
    if (val < 0.8) el.classList.add("danger");
    else if (val < 1) el.classList.add("warning");
    else el.classList.add("success");
  }

  if (key === "sales_perf") {
    if (val > 0) el.classList.add("success");
    else if (val < 0) el.classList.add("danger");
  }
}

/* ================= FORMAT ================= */

function format(num, key) {
  if (["mtd_sales", "target_mtd", "apc_avg"].includes(key))
    return "Rp " + num.toLocaleString("id-ID");

  if (key === "achievment" || key === "sales_perf")
    return (num * 100).toFixed(2) + "%";

  if (key === "traffic_avg")
    return Math.round(num).toLocaleString("id-ID");

  return num;
}

console.log("✅ DASHBOARD FINAL — UI STABLE — KPI & INSIGHT FIXED");
/* ================= THEME TOGGLE ================= */

const toggleBtn = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
  toggleBtn.innerText = "☀️ Light Mode";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  toggleBtn.innerText = isLight ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});
const insight = document.querySelector(".insight");

if (insight) {
  insight.addEventListener("mousemove", e => {
    const rect = insight.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    insight.style.setProperty("--x", `${x}px`);
    insight.style.setProperty("--y", `${y}px`);
  });
}
/* ===============================
   CURSOR TRACKING FOR ALL CARDS
================================ */

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  });
});
