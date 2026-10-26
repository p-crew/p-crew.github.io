/* Mathematical regression checks. Run: node --test tests/figure-math.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

function load(name, environment = {}) {
  let definition;
  class SiteFigure {
    constructor() { this.state = {}; }
    setState(patch, callback) {
      this.state = Object.assign({}, this.state, patch);
      if (callback) callback.call(this);
    }
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/figures', name + '.js'), 'utf8'), {
    SiteFigure, SiteFigures: { register: (_, def) => { definition = def; } },
    window: { matchMedia: () => ({ matches: true }) },
    cancelAnimationFrame() {}, ...environment
  }, { filename: name + '.js' });
  return { figure: new definition.Component(), markup: definition.markup };
}

function near(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`);
}

test('GBM bound uses proof-compatible constants, rather than K = 1', () => {
  const { figure } = load('nonexist');
  figure.state.T = 40;
  const bound = figure.estimate();
  near(bound.eps, 0.2);
  near(bound.K, 0.10045093868225047);
  near(bound.L, 0.6990130670565355);
  const out = figure.renderVals();
  assert.equal(out.vLong, true);
  assert.equal(out.negLabel, '0 / 40');
  assert.equal(out.paths.length, 40);
  figure.state.T = 80;
  assert.equal(figure.renderVals().vLong, true);
  assert.equal(figure.renderVals().negLabel, '40 / 40');
});

test('GBM theorem and bound exclude zero volatility and inapplicable horizons', () => {
  const { figure } = load('nonexist');
  Object.assign(figure.state, { T: 40, sig: 0 });
  let out = figure.renderVals();
  assert.equal(out.vZero, true);
  assert.equal(out.vLong, false);
  assert.equal(out.vNa, false);
  assert.equal(out.paths.length, 0);
  assert.equal(out.LLabel, '—');
  Object.assign(figure.state, { T: 1, sig: 0.1 });
  out = figure.renderVals();
  assert.equal(out.vLong, true); // The asymptotic theorem is independent of the selected T.
  assert.equal(out.noBound, true);
  assert.equal(out.paths.length, 0);
  Object.assign(figure.state, { T: 40, mu: -0.1 });
  assert.equal(figure.renderVals().vNa, true);
  assert.equal(figure.renderVals().vLong, false);
});

test('terminal-interval choices satisfy the depletion estimate across the controls', () => {
  const { figure } = load('nonexist');
  for (const g of [0.3, 0.5, 1, 2, 4]) for (const r of [-0.02, 0, 0.1])
    for (const d of [0, 0.05, 0.15]) for (const mu of [-0.1, 0.05, 0.3])
      for (const sig of [0.01, 0.1, 0.6]) {
        Object.assign(figure.state, { g, r, d, mu, sig, T: 80 });
        const { eps, K, L, available } = figure.estimate();
        const A = Math.exp((d + Math.abs(1 - g) * Math.abs(r)) / g);
        assert.ok(eps > 0 && eps <= 1);
        assert.ok(A * eps * (1 + Math.exp((Math.abs(mu) + Math.abs(r)) * eps)) <= 0.5 + 1e-14);
        assert.ok(Number.isFinite(K) && K > 0);
        if (available) assert.ok(Number.isFinite(L) && L > 0);
      }
  // The exponential-moment formula must also handle a zero exponent.
  Object.assign(figure.state, { g: 1, mu: 0, r: 0, d: 0, sig: 0 });
  near(figure.estimate().K, 0.1);
});

// An independent ODE integration checks the analytic solution, including
// multiple turns for c > 1 and drivers beyond the old lookup interval [-8, 8].
function integrateFlow(c, end) {
  const steps = Math.max(1, Math.ceil(Math.abs(end) / 0.001)), h = end / steps;
  let y = 0;
  const f = v => c + Math.cos(v);
  for (let i = 0; i < steps; i++) {
    const k1 = f(y), k2 = f(y + h * k1 / 2), k3 = f(y + h * k2 / 2), k4 = f(y + h * k3);
    y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  }
  return y;
}

test('rough flow agrees with the ODE and its inverse recovers uncapped drivers', () => {
  const { figure } = load('rough');
  for (const c of [0.2, 0.5, 0.99, 1, 1.01, 1.4, 2.5]) {
    const flow = figure.flow(c);
    for (const s of [-12, -8.5, -3, 0, 0.2, 8.5, 12]) {
      const y = flow.theta(s);
      near(y, integrateFlow(c, s), 1e-8);
      near(flow.phi(y), s, 1e-7);
    }
    if (c > 1) {
      const period = 2 * Math.PI / Math.sqrt(c * c - 1);
      near(flow.theta(0.7 + period) - flow.theta(0.7), 2 * Math.PI, 1e-10);
      for (const y of [-3 * Math.PI, -Math.PI, Math.PI, 3 * Math.PI]) {
        for (const offset of [-1e-9, 0, 1e-9]) near(flow.theta(flow.phi(y + offset)), y + offset, 1e-8);
      }
    }
  }
});

test('rough inverse rejects observations at or beyond zeros, including c = 1', () => {
  const { figure } = load('rough');
  for (const c of [0.2, 0.99, 1]) {
    const flow = figure.flow(c), a = Math.acos(-c);
    for (const y of [-a - 0.01, -a, a, a + 0.01]) assert.equal(flow.phi(y), null);
    for (const y of [-a + 1e-10, a - 1e-10]) assert.ok(Number.isFinite(flow.phi(y)));
  }
});

test('the audited noisy observation is a gap, not a fabricated driver value', () => {
  const { figure } = load('rough');
  Object.assign(figure.state, { c: 0.2, logNoise: -1.5, rSeed: 15 });
  const data = figure.recovery(), out = figure.renderVals();
  assert.deepEqual(Array.from(data.invalid), [379]);
  assert.equal(data.R[379], null);
  assert.ok(data.maxErr < 2);
  assert.equal(out.hasInvalid, true);
  assert.equal(out.invalidMarks.length, 1);
  assert.equal((out.recPath.match(/M/g) || []).length, 2);
  assert.ok(!/NaN|Infinity/.test(out.recPath));
});

test('Gaussian intensity plot retains every observation at both noise settings', () => {
  const { figure } = load('trace');
  for (const s of [0.14, 0.4]) {
    figure.state.s = s;
    const out = figure.renderVals();
    const points = [...out.obs.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g)];
    assert.equal(points.length, figure.T);
    const lo = +out.yMinLabel, hi = +out.yMaxLabel;
    let outsideOldWindow = 0;
    for (let i = 0; i < figure.T; i++) {
      const raw = figure.mu[figure.z[i]] + s * figure.noise[i];
      if (raw < -0.23 || raw > 1.23) outsideOldWindow++;
      assert.ok(raw > lo && raw < hi);
      const recovered = lo + (296 - +points[i][2]) * (hi - lo) / 280;
      near(recovered, raw, 0.051 * (hi - lo) / 280);
    }
    assert.equal(outsideOldWindow, s === 0.4 ? 130 : 14);
    assert.equal(out.acc, s === 0.4 ? '89.3%' : '99.2%');
  }
});

test('scan stops at its own length in reduced motion and never exceeds the budget', () => {
  const { figure } = load('scan');
  near(figure.pathLength('spiral'), 7.88);
  for (const key of ['raster', 'spiral', 'liss']) {
    figure.state.path = key;
    assert.ok((figure.paths[key].length - 1) * figure.ds <= 10);
    figure.play();
    near(figure.state.prog, figure.pathLength(key));
    assert.equal(figure.renderVals().distLabel, figure.pathLength(key).toFixed(2));
  }
  figure.state.path = 'spiral'; figure.state.prog = 10;
  assert.equal(figure.renderVals().distLabel, '7.88');
  assert.match(figure.renderVals().completionLabel, /complete/);
});

test('animated scan preserves speed and stops scheduling frames at the endpoint', () => {
  let pending;
  const { figure } = load('scan', {
    window: { matchMedia: () => ({ matches: false }) },
    performance: { now: () => 0 },
    requestAnimationFrame: fn => { pending = fn; return 1; }
  });
  figure.state.path = 'spiral';
  figure.play();
  pending(3000);
  near(figure.state.prog, 10 / 3);
  const last = pending; pending = null;
  last(9000);
  near(figure.state.prog, 7.88);
  assert.equal(pending, null);
});

test('Lotka–Volterra identifies the deterministic solver discrepancy', () => {
  const { figure } = load('lv');
  figure.state.sigma = 0; figure.simulate(0);
  assert.equal(figure.renderVals().zeroNoise, true);
  const H = ([x, y]) => 0.5 * x - 0.75 * Math.log(x) + y - 0.75 * Math.log(y);
  assert.ok(H(figure.sto.at(-1)) - H(figure.sto[0]) > 0.01);
  near(H(figure.det.at(-1)), H(figure.det[0]), 1e-9);
});
