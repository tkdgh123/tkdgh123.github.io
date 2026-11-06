// 술술의 그림: 실 · 구슬 · 매듭. 전부 코드로 그리는 선이라 색만 바꿔 어디서나 쓴다.
const K = {
  // 엉킨 매듭. amt 1 = 꽉 엉킴, 0 = 다 풀림
  tangle(cx, cy, r, seed = 0, amt = 1) {
    let d = "";
    for (let i = 0; i <= 180; i++) {
      const t = i / 180 * Math.PI * 6, R = r * amt * (.45 + .55 * Math.abs(Math.sin(t * 1.7 + seed)));
      d += (i ? "L" : "M") + (cx + R * Math.cos(t * 1.31 + seed)).toFixed(1) + " " + (cy + R * Math.sin(t)).toFixed(1);
    }
    return d;
  },
  // 가로로 놓인 실. 가운데 매듭이 p(0~1)만큼 풀린 모양
  thread(w, h, p, loops = 3) {
    const ax = 34 * (1 - p), ay = h * .36 * (1 - p);
    let d = "";
    for (let i = 0; i <= 240; i++) {
      const s = i / 240, wt = Math.exp(-(((s - .5) / .17) ** 2)), ph = Math.PI * 2 * loops * (s - .5) / .34;
      const x = s * w + ax * wt * Math.sin(ph), y = h / 2 + ay * wt * Math.cos(ph) - ay * wt * .2;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  },
  // 잘 맺은 매듭 장식(꽃잎 네 장): 타래 하나를 다 풀면 얻는다
  ornament(cx, cy, r) {
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const t = i / 200 * Math.PI * 2, R = r * (.35 + .65 * Math.abs(Math.cos(2 * t)));
      d += (i ? "L" : "M") + (cx + R * Math.cos(t)).toFixed(1) + " " + (cy + R * Math.sin(t)).toFixed(1);
    }
    return d + "Z";
  },
  // 두 점을 위아래로 부드럽게 잇는 실
  link(a, b) { const m = (b.y - a.y) / 2; return `M${a.x} ${a.y}C${a.x} ${a.y + m},${b.x} ${b.y - m},${b.x} ${b.y}` },
  bead(cx, cy, r, color) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><circle cx="${cx - r * .35}" cy="${cy - r * .35}" r="${r * .28}" fill="#fff" opacity=".45"/>` }
};
