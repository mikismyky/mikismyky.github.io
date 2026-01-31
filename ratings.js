
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

    // Google obaluje JSON divným stringem
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const rows = json.table.rows;

    const ratings = rows
      .map(r => r.c[RATING_COLUMN_INDEX]?.v)
      .filter(v => typeof v === "number");

    if (ratings.length === 0) {
      console.warn("Žádná hodnocení");
      return;
    }

    const avg =
      ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // číslo
    document.getElementById("avg-rating").textContent =
      avg.toFixed(1);

    // hvězdičky
    renderStars(avg);
  } catch (err) {
    console.error("Chyba při načítání hodnocení:", err);
  }
}

function renderStars(avg) {
  const fullStars = Math.floor(avg);
  const halfStar = avg % 1 >= 0.5;

  let stars = "★".repeat(fullStars);
  if (halfStar) stars += "☆";
  stars = stars.padEnd(5, "☆");

  document.getElementById("stars").textContent = stars;
}

// první načtení
loadRatings();

// automatický refresh
setInterval(loadRatings, REFRESH_INTERVAL);// JavaScript Document