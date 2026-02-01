const SHEET_ID = "1EYcdPiwaDppt3KxbVaISrjh5Bgp0QQW-FRyiyGLPQnQ";
const SHEET_NAME = "List1";
const RATING_COLUMN_INDEX = 3;
const REFRESH_INTERVAL = 60_000; // 1 minuta

const URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

async function loadRatings() {
  try {
    const res = await fetch(URL + "&_=" + Date.now());
    const text = await res.text();

    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    // ⭐ PRŮMĚR
    const ratings = rows
      .map(r => r.c[RATING_COLUMN_INDEX]?.v)
      .filter(v => typeof v === "number");

    if (ratings.length) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      document.getElementById("avg-rating").textContent = avg.toFixed(2);
      renderAvgStars(avg);
    }

    // ⭐ RECENZE
    const container = document.getElementById("reviews");
    container.innerHTML = "";

    rows.reverse(); // nejnovější nahoře

    rows.forEach(r => {
      const date = r.c[2]?.f || r.c[2]?.v || "";
      const rating = r.c[3]?.v || 0;
      const nickname = r.c[4]?.v || "Anonym";
      const comment = r.c[5]?.v || "";

      const review = document.createElement("div");
      review.className = "review";

      review.innerHTML = `
        <div class="review-name">${nickname}</div>
        <div style="font-size:0.8rem; opacity:0.7;">${date}</div>
        <div class="review-stars">
          ${renderReviewStars(rating)}
        </div>
        <div class="review-text">${comment}</div>
      `;

      container.appendChild(review);
    });
  } catch (err) {
    console.error("Chyba při načítání hodnocení:", err);
  }
}

/* ⭐ HVĚZDY PRO PRŮMĚR (DOM) */
function renderAvgStars(avg) {
  const container = document.getElementById("stars");
  container.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const fill = document.createElement("div");
    fill.className = "star-fill";

    const value = Math.max(0, Math.min(1, avg - i));
    fill.style.width = `${value * 100}%`;

    star.appendChild(fill);
    container.appendChild(star);
  }
}

/* ⭐ HVĚZDY PRO RECENZE (HTML STRING) */
function renderReviewStars(value) {
  let html = "";
  for (let i = 0; i < 5; i++) {
    const percent = Math.max(0, Math.min(1, value - i)) * 100;
    html += `
      <div class="star">
        <div class="star-fill" style="width:${percent}%"></div>
      </div>
    `;
  }
  return html;
}

loadRatings();
setInterval(loadRatings, REFRESH_INTERVAL);
