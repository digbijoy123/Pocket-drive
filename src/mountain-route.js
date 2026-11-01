/**
 * Pocket Drive 3D — parametric mountain route foundation.
 *
 * The route is defined by world-space control points [x, y, z], not by x(z).
 * This permits genuine hairpins where the road doubles back in world Z.
 * No scene objects are created here; callers own mesh/material lifetimes.
 */
export function createMountainRoute(THREE, options = {}) {
  const roadWidth = options.roadWidth ?? 7.2;
  const sampleSpacing = options.sampleSpacing ?? 2.5;
  const controls = [
    [0, 3, -600], [8, 3, 0], [45, 5, 420], [120, 8, 900],
    [210, 12, 1450], [300, 18, 1950], [390, 25, 2450],
    // First real hairpin: the route turns back downhill in Z.
    [470, 32, 2780], [520, 39, 2500], [455, 48, 2120],
    [330, 58, 1840], [210, 69, 2040], [170, 82, 2480],
    [250, 95, 2910], [405, 108, 3200], [570, 122, 3000],
    // Second hairpin, climbing on a parallel shelf.
    [680, 137, 2650], [625, 151, 2260], [480, 164, 2040],
    [335, 178, 2220], [300, 192, 2670], [390, 205, 3100],
    [560, 218, 3380], [735, 230, 3200],
    // Summit ridge and a long descending sequence of linked bends.
    [860, 238, 2820], [930, 235, 2400], [880, 222, 1980],
    [760, 205, 1630], [620, 185, 1330], [470, 162, 1120],
    [320, 138, 850], [190, 112, 570], [85, 82, 260],
    [-15, 50, -80], [-65, 25, -430], [0, 3, -600]
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));

  const curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal', 0.35);
  const estimatedLength = curve.getLength();
  const count = Math.max(2, Math.ceil(estimatedLength / sampleSpacing));
  const table = [];
  let distance = 0;
  let previous = curve.getPointAt(0);
  table.push({ s: 0, t: 0, point: previous.clone() });

  for (let i = 1; i <= count; i++) {
    const t = i / count;
    const point = curve.getPointAt(t);
    distance += point.distanceTo(previous);
    table.push({ s: distance, t, point: point.clone() });
    previous = point;
  }

  function bracket(s) {
    const target = THREE.MathUtils.clamp(s, 0, distance);
    let lo = 0, hi = table.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (table[mid].s < target) lo = mid + 1;
      else hi = mid;
    }
    return Math.max(1, lo);
  }

  function sample(s) {
    const i = bracket(s);
    const a = table[i - 1], b = table[i];
    const f = b.s === a.s ? 0 : (THREE.MathUtils.clamp(s, 0, distance) - a.s) / (b.s - a.s);
    const t = THREE.MathUtils.lerp(a.t, b.t, f);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    // Horizontal right vector; stable even on steep grades.
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const up = new THREE.Vector3().crossVectors(right, tangent).normalize();
    return { s: THREE.MathUtils.clamp(s, 0, distance), point, tangent, right, up, roadWidth };
  }

  function project(position, hintS = 0, searchRadius = 260) {
    // Local search first keeps projection stable at hairpins; global fallback handles respawns.
    const lo = Math.max(0, hintS - searchRadius);
    const hi = Math.min(distance, hintS + searchRadius);
    let bestS = hintS, bestD2 = Infinity;
    const scan = (from, to, step) => {
      for (let s = from; s <= to; s += step) {
        const p = sample(s).point;
        const dx = position.x - p.x, dz = position.z - p.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < bestD2) { bestD2 = d2; bestS = s; }
      }
    };
    scan(lo, hi, 2.5);
    if (bestD2 > 180 * 180) {
      bestD2 = Infinity;
      scan(0, distance, 8);
    }
    return { s: bestS, distance: Math.sqrt(bestD2), frame: sample(bestS) };
  }

  return {
    length: distance,
    roadWidth,
    sample,
    project,
    // Expose a copy of the control points for route diagnostics, not mutation.
    controlPoints: controls.map(point => point.clone())
  };
}
