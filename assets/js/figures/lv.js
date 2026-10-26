/* Interactive figure: stochastic Lotka-Volterra model. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<div style="overflow-x: auto; font-size: 14px; color: #515C55">\[\mathrm{d}X_t = (\beta_1 - \alpha_1 Y_t)X_t\,\mathrm{d}t + \sigma X_t\,\mathrm{d}W^{(1)}_t, \qquad \mathrm{d}Y_t = (\alpha_2 X_t - \beta_2)Y_t\,\mathrm{d}t + \sigma Y_t\,\mathrm{d}W^{(2)}_t\]</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 24px; margin-top: 8px">
<div style="min-width: 0">
<p style="margin: 0 0 6px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #515C55"><span style="display: inline-block; width: 14px; height: 2px; vertical-align: middle; background: #244F46"></span> prey \(X_t\)   <span style="display: inline-block; width: 14px; height: 2px; vertical-align: middle; background: #9D5C3E"></span> predator \(Y_t\)   <span style="display: inline-block; width: 14px; height: 0; vertical-align: middle; border-top: 1.5px dashed #A3ACA0"></span> deterministic</p>
<svg viewBox="0 0 420 280" role="img" aria-label="Prey and predator populations against time, for the stochastic model and the deterministic model." style="display: block; width: 100%; height: auto">
<defs><clipPath id="lvTs"><rect x="44" y="12" width="364" height="228"></rect></clipPath></defs>
<line x1="44" x2="408" y1="12" y2="12" stroke="#EDF0E7"></line>
<line x1="44" x2="408" y1="69" y2="69" stroke="#EDF0E7"></line>
<line x1="44" x2="408" y1="126" y2="126" stroke="#EDF0E7"></line>
<line x1="44" x2="408" y1="183" y2="183" stroke="#EDF0E7"></line>
<line x1="44" x2="408" y1="240" y2="240" stroke="#B8C1B6"></line>
<line x1="44" x2="44" y1="12" y2="240" stroke="#B8C1B6"></line>
<text x="36" y="16" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">4</text>
<text x="36" y="73" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">3</text>
<text x="36" y="130" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">2</text>
<text x="36" y="187" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">1</text>
<text x="36" y="244" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0</text>
<text x="44" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">0</text>
<text x="226" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">20</text>
<text x="408" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">40</text>
<text x="408" y="274" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">t</text>
<g clip-path="url(#lvTs)" fill="none" stroke-linejoin="round">
<path stroke="#A3ACA0" stroke-width="1.2" stroke-dasharray="4 3" data-bind="d:detX"></path>
<path stroke="#A3ACA0" stroke-width="1.2" stroke-dasharray="4 3" data-bind="d:detY"></path>
<path stroke="#244F46" stroke-width="1.5" data-bind="d:tsX"></path>
<path stroke="#9D5C3E" stroke-width="1.5" data-bind="d:tsY"></path>
</g>
</svg>
</div>
<div style="min-width: 0">
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Phase plane: the deterministic orbit (dashed) is closed; the stochastic path drifts between orbits</p>
<svg viewBox="0 0 420 280" role="img" aria-label="Predator against prey: a closed deterministic orbit and a stochastic path that wanders between orbits." style="display: block; width: 100%; height: auto">
<defs><clipPath id="lvPh"><rect x="44" y="12" width="364" height="228"></rect></clipPath></defs>
<line x1="44" x2="408" y1="12" y2="12" stroke="#EDF0E7"></line>
<line x1="44" x2="408" y1="126" y2="126" stroke="#EDF0E7"></line>
<line x1="44" x2="408" y1="240" y2="240" stroke="#B8C1B6"></line>
<line x1="44" x2="44" y1="12" y2="240" stroke="#B8C1B6"></line>
<text x="36" y="16" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">2</text>
<text x="36" y="130" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">1</text>
<text x="36" y="244" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0</text>
<text x="44" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">0</text>
<text x="135" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">1</text>
<text x="226" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">2</text>
<text x="317" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">3</text>
<text x="408" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">4</text>
<text x="408" y="274" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">prey X</text>
<text x="52" y="26" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061">predator Y</text>
<g clip-path="url(#lvPh)" fill="none" stroke-linejoin="round">
<path stroke="#9D5C3E" stroke-width="1.6" stroke-dasharray="5 3" data-bind="d:phDet"></path>
<path stroke="#244F46" stroke-width="1.2" data-bind="d:ph"></path>
</g>
<circle r="4" fill="#203D36" data-bind="cx:headX; cy:headY"></circle>
</svg>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 16px 32px; align-items: center; margin-top: 12px; padding-top: 16px; border-top: 1px solid #EDF0E7">
<label style="flex: 1 1 240px; display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55">
<span>noise \(\sigma =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="sigLabel"></span></span></span>
<input type="range" min="0" max="0.15" step="0.005" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:sigma" data-on="input:setSigma">
</label>
<button type="button" style="font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid #244F46; background: #244F46; color: #FFFFFF; font-size: 14px" data-on="click:again">New path</button>
</div>
<figcaption style="margin-top: 14px; font-size: 14px; color: #515C55">A predator–prey model with independent multiplicative noise on each population, after the example in the dissertation. The noise is diagonal, so the Milstein scheme needs no iterated integrals: each component gets the correction \(\tfrac12\sigma^2 X(\Delta W^2 - h)\). Here \(h = 0.005\), \(\beta_1 = 0.75\), \(\alpha_1 = 1\), \(\alpha_2 = 0.5\), \(\beta_2 = 0.75\), started from \((1, 1)\); the deterministic orbit is computed with Runge–Kutta. Even with \(\sigma = 0.05\) the path leaves the closed orbit within a few cycles, and wanders between neighbouring orbits.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { sigma: 0.05, seed: 4, prog: 1 };
      this.h = 0.005;
      this.T = 45;
      this.n = Math.round(this.T / this.h);
      this.stride = 5;
      this.par = { b1: 0.75, a1: 1, a2: 0.5, b2: 0.75 };
      this.det = this.rk4();
      this.noise(4);
      this.simulate(0.05);
    }
    rng(seed) {
      var a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    noise(seed) {
      var r = this.rng(seed), n = this.n, sq = Math.sqrt(this.h);
      this.w1 = new Float64Array(n);
      this.w2 = new Float64Array(n);
      for (var i = 0; i < n; i++) {
        var u = Math.sqrt(-2 * Math.log(1 - r())), v = 2 * Math.PI * r();
        this.w1[i] = sq * u * Math.cos(v);
        this.w2[i] = sq * u * Math.sin(v);
      }
    }
    rk4() {
      var p = this.par, h = this.h, x = 1, y = 1, out = [[x, y]];
      var f = function (a, b) { return [(p.b1 - p.a1 * b) * a, (p.a2 * a - p.b2) * b]; };
      for (var i = 1; i <= this.n; i++) {
        var k1 = f(x, y), k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1]), k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1]), k4 = f(x + h * k3[0], y + h * k3[1]);
        x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
        y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        if (i % this.stride === 0) out.push([x, y]);
      }
      return out;
    }
    simulate(sigma) {
      var p = this.par, h = this.h, x = 1, y = 1, out = [[x, y]], s2 = 0.5 * sigma * sigma;
      for (var i = 0; i < this.n; i++) {
        var d1 = this.w1[i], d2 = this.w2[i];
        var nx = x + (p.b1 - p.a1 * y) * x * h + sigma * x * d1 + s2 * x * (d1 * d1 - h);
        var ny = y + (p.a2 * x - p.b2) * y * h + sigma * y * d2 + s2 * y * (d2 * d2 - h);
        x = Math.max(nx, 1e-6);
        y = Math.max(ny, 1e-6);
        if ((i + 1) % this.stride === 0) out.push([x, y]);
      }
      this.sto = out;
    }
    play() {
      if (this.raf) cancelAnimationFrame(this.raf);
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { this.setState({ prog: 1 }); return; }
      var self = this, t0 = performance.now(), dur = 6000;
      var tick = function (now) {
        var q = Math.min(1, (now - t0) / dur);
        self.setState({ prog: q });
        if (q < 1) self.raf = requestAnimationFrame(tick);
      };
      this.setState({ prog: 0 });
      this.raf = requestAnimationFrame(tick);
    }
    componentDidMount() { this.play(); }
    componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
    renderVals() {
      var self = this, st = this.state, N = this.sto.length, upto = Math.max(2, Math.round(st.prog * (N - 1)) + 1);
      var tx = function (i) { return 44 + 364 * (i / (N - 1)) * self.T / 40; };
      var ty = function (v) { return 240 - 57 * v; };
      var px = function (v) { return 44 + 91 * v; };
      var py = function (v) { return 240 - 114 * v; };
      var series = function (arr, c, m) {
        var d = '';
        for (var i = 0; i < m; i++) d += (i ? 'L' : 'M') + tx(i).toFixed(1) + ' ' + Math.max(-50, ty(arr[i][c])).toFixed(1);
        return d;
      };
      var phase = function (arr, m) {
        var d = '';
        for (var i = 0; i < m; i++) d += (i ? 'L' : 'M') + px(Math.min(arr[i][0], 8)).toFixed(1) + ' ' + Math.max(-50, py(arr[i][1])).toFixed(1);
        return d;
      };
      var head = this.sto[upto - 1];
      return {
        detX: series(this.det, 0, this.det.length), detY: series(this.det, 1, this.det.length),
        tsX: series(this.sto, 0, upto), tsY: series(this.sto, 1, upto),
        phDet: phase(this.det, Math.min(this.det.length, 360)), ph: phase(this.sto, upto),
        headX: px(Math.min(head[0], 8)).toFixed(1), headY: Math.max(-50, py(head[1])).toFixed(1),
        sigma: st.sigma, sigLabel: st.sigma.toFixed(3),
        setSigma: function (e) { var v = parseFloat(e.target.value); self.simulate(v); self.setState({ sigma: v }); },
        again: function () { var sd = st.seed + 1; self.noise(sd); self.simulate(st.sigma); self.setState({ seed: sd }); self.play(); }
      };
    }
  }

  SiteFigures.register('lv', { markup: markup, Component: Component });
})();
