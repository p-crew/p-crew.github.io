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

// An independent fine-step ODE integration checks the tabulated flow, both
// trapped between zeros (c < 3√3/4) and turning through several periods.
const roughF = (c, v) => c + Math.sin(v) + 0.5 * Math.sin(2 * v);
function integrateFlow(c, end) {
  const steps = Math.max(1, Math.ceil(Math.abs(end) / 0.0005)), h = end / steps;
  let y = 0;
  const f = v => roughF(c, v);
  for (let i = 0; i < steps; i++) {
    const k1 = f(y), k2 = f(y + h * k1 / 2), k3 = f(y + h * k2 / 2), k4 = f(y + h * k3);
    y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  }
  return y;
}

test('rough flow agrees with the ODE and its inverse recovers the driver', () => {
  const { figure } = load('rough');
  for (const c of [0.2, 0.5, 1, 1.29, 1.3, 1.4, 1.6, 2.5]) {
    const flow = figure.flow(c);
    for (const s of [-12, -8.5, -3, 0, 0.2, 3, 8.5, 12]) {
      const y = flow.theta(s);
      near(y, integrateFlow(c, s), 1e-8);
      // Deep in a trapped tail, y is within rounding of the zero and cannot be inverted.
      if (Math.abs(roughF(c, y)) > 1e-6) near(flow.phi(y), s, 1e-6);
    }
    if (c >= 3 * Math.sqrt(3) / 4) {
      near(flow.theta(0.7 + flow.period) - flow.theta(0.7), 2 * Math.PI, 1e-10);
      for (const y of [-3 * Math.PI, -Math.PI, Math.PI, 3 * Math.PI]) {
        for (const offset of [-1e-9, 0, 1e-9]) near(flow.theta(flow.phi(y + offset)), y + offset, 1e-8);
      }
    }
  }
});

test('rough zeros appear exactly below 3√3/4 and the inverse rejects them', () => {
  const { figure } = load('rough');
  const cstar = 3 * Math.sqrt(3) / 4;
  assert.equal(figure.flow(cstar + 1e-9).lo, -Infinity);
  for (const c of [0.2, 1, 1.29]) {
    const flow = figure.flow(c);
    assert.ok(flow.lo < 0 && flow.lo > -Math.PI / 3 && flow.hi > Math.PI && flow.hi < 5 * Math.PI / 3);
    near(roughF(c, flow.lo), 0, 1e-12);
    near(roughF(c, flow.hi), 0, 1e-12);
    for (const y of [flow.lo - 0.01, flow.lo, flow.hi, flow.hi + 0.01]) assert.equal(flow.phi(y), null);
    for (const y of [flow.lo + 1e-9, flow.hi - 1e-9]) assert.ok(Number.isFinite(flow.phi(y)));
  }
});

test('noisy observations beyond a zero are gaps, not fabricated driver values', () => {
  const { figure } = load('rough');
  Object.assign(figure.state, { c: 0.2, logNoise: -1.5, rSeed: 4 });
  const data = figure.recovery(), out = figure.renderVals();
  assert.ok(data.invalid.length > 0);
  for (const i of data.invalid) assert.equal(data.R[i], null);
  assert.ok(Number.isFinite(data.maxErr));
  assert.equal(out.hasInvalid, true);
  assert.equal(out.invalidMarks.length, data.invalid.length);
  const pieces = (out.recPath.match(/M/g) || []).length;
  assert.ok(pieces >= 1 && pieces <= data.invalid.length + 1);
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

test('GBM plane tracks drag pointer capture, touch cancellation, and keyboard controls', () => {
  const { figure, markup } = load('nonexist');
  assert.match(markup, /pointerdown:pickStart; pointermove:pickMove/);
  assert.match(markup, /touch-action: none/);
  assert.match(markup, /keydown:pickKey/);
  let captured = null, releases = 0, prevented = 0;
  const svg = {
    getBoundingClientRect: () => ({ left: 80, top: 100, width: 600, height: 360 }),
    setPointerCapture(id) { captured = id; },
    hasPointerCapture(id) { return captured === id; },
    releasePointerCapture(id) { assert.equal(id, captured); captured = null; releases++; }
  };
  const event = (type, sig, mu, id = 7, overrides = {}) => ({
    type,
    currentTarget: svg,
    pointerType: 'mouse',
    button: 0,
    pointerId: id,
    clientX: 80 + 56 + 520 * sig / 0.6,
    clientY: 100 + 320 - 296 * (mu + 0.1) / 0.4,
    preventDefault() { prevented++; },
    ...overrides
  });

  figure.renderVals().pickStart(event('pointerdown', 0.15, 0.08));
  assert.equal(captured, 7);
  assert.equal(figure.touched, true);
  near(figure.state.sig, 0.15);
  near(figure.state.mu, 0.08);

  figure.renderVals().pickMove(event('pointermove', 0.42, 0.21));
  near(figure.state.sig, 0.42);
  near(figure.state.mu, 0.21);
  figure.renderVals().pickMove(event('pointermove', 0.6, -0.1, 9));
  near(figure.state.sig, 0.42); // A different pointer cannot hijack the drag.
  figure.renderVals().pickEnd(event('pointerup', 0.5, 0.25));
  near(figure.state.sig, 0.5);
  near(figure.state.mu, 0.25);
  assert.equal(captured, null);
  figure.renderVals().pickMove(event('pointermove', 0.1, 0.1));
  near(figure.state.sig, 0.5); // No updates after release.

  figure.renderVals().pickStart(event('pointerdown', 0.2, -0.03, 8, { pointerType: 'touch' }));
  figure.renderVals().pickMove(event('pointermove', 1, 1, 8, { pointerType: 'touch' }));
  near(figure.state.sig, 0.6); // Clamp drags outside the plot.
  near(figure.state.mu, 0.3);
  figure.renderVals().pickEnd(event('pointercancel', 0.6, 0.3, 8, { pointerType: 'touch' }));
  assert.equal(captured, null);
  figure.renderVals().pickMove(event('pointermove', 0.2, -0.03, 8));
  near(figure.state.sig, 0.6);
  assert.equal(releases, 2);

  figure.renderVals().pickStart(event('pointerdown', 0.1, -0.1, 10, { button: 2 }));
  assert.equal(captured, null); // Ignore secondary mouse buttons.
  figure.renderVals().pickKey({ key: 'ArrowLeft', shiftKey: false, preventDefault() { prevented++; } });
  near(figure.state.sig, 0.59);
  figure.renderVals().pickKey({ key: 'ArrowDown', shiftKey: true, preventDefault() { prevented++; } });
  near(figure.state.mu, 0.275);
  assert.ok(prevented >= 6);
});

test('Lotka–Volterra caption omits the dissertation aside', () => {
  const { markup } = load('lv');
  assert.doesNotMatch(markup, /as in the dissertation/);
  assert.match(markup, /independent multiplicative noise on each population/i);
});
