
// 🔴 1) ID Google Sheets (z URL)
const SHEET_ID = "1EYcdPiwaDppt3KxbVaISrjh5Bgp0QQW-FRyiyGLPQnQ";

// 🔴 2) PŘESNÝ název listu
const SHEET_NAME = "List1";

// 🔴 3) Index sloupce s hodnocením (0 = A, 1 = B, 2 = C...)
const RATING_COLUMN_INDEX = 3;

// 🔴 4) Jak často se má refreshnout (v ms)
const REFRESH_INTERVAL = 60_000; // 1 minuta

/***********************
 *  KÓD – NA TO NESAHEJ
 ***********************/

const URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

async function loadRatings() {
  try {
    const res = await fetch(URL + "&_=" + Date.now());
    const text = await res.text();

    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const ratings = rows
      .map(r => r.c[RATING_COLUMN_INDEX]?.v)
      .filter(v => typeof v === "number");

    if (!ratings.length) return;

    const avg =
      ratings.reduce((a, b) => a + b, 0) / ratings.length;

    document.getElementById("avg-rating").textContent =
      avg.toFixed(2);

    renderStars(avg);
  } catch (err) {
    console.error("Chyba při načítání hodnocení:", err);
  }
}

function renderStars(avg) {
  const container = document.getElementById("stars");
  container.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const fill = document.createElement("div");
    fill.className = "star-fill";

    // plynulé vyplnění (0.00–1.00)
    const value = Math.max(0, Math.min(1, avg - i));
    fill.style.width = `${value * 100}%`;

    star.appendChild(fill);
    container.appendChild(star);
  }
}

loadRatings();
setInterval(loadRatings, REFRESH_INTERVAL);
