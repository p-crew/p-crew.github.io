/* Interactive figure: stochastic Lotka-Volterra model. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">A stochastic predator–prey model</p>
<p class="fig-lead">Lotka–Volterra dynamics with independent multiplicative noise on each population, simulated with the Milstein scheme. Without noise the orbits are closed; with noise the path drifts from one orbit to another.</p>
<div class="fig-eq">\[\begin{aligned} \mathrm{d}X_t &= (\beta_1 - \alpha_1 Y_t)\,X_t\,\mathrm{d}t + \sigma X_t\,\mathrm{d}W^{(1)}_t \\ \mathrm{d}Y_t &= (\alpha_2 X_t - \beta_2)\,Y_t\,\mathrm{d}t + \sigma Y_t\,\mathrm{d}W^{(2)}_t \end{aligned}\]</div>
</div>
<div class="fig-plots">
<div>
<ul class="fig-legend">
<li><span class="sw c-teal"></span>prey \(X_t\)</li>
<li><span class="sw c-rust"></span>predator \(Y_t\)</li>
<li><span class="sw dash c-grey"></span>deterministic</li>
</ul>
<svg viewBox="0 0 420 280" role="img" aria-label="Prey and predator populations against time, for the stochastic model and the deterministic model.">
<defs><clipPath id="lvTs"><rect x="44" y="12" width="364" height="228"></rect></clipPath></defs>
<path d="M44 12V240H408" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="end">
<text x="36" y="244">0</text><text x="36" y="187">1</text><text x="36" y="130">2</text><text x="36" y="73">3</text><text x="36" y="16">4</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="middle">
<text x="44" y="258">0</text><text x="135" y="258">10</text><text x="226" y="258">20</text><text x="317" y="258">30</text><text x="408" y="258">40</text>
</g>
<text x="408" y="276" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="#657061" text-anchor="end">t</text>
<g clip-path="url(#lvTs)" fill="none" stroke-linejoin="round">
<path stroke="#A3ACA0" stroke-width="1.2" stroke-dasharray="4 3" data-bind="d:detX"></path>
<path stroke="#A3ACA0" stroke-width="1.2" stroke-dasharray="4 3" data-bind="d:detY"></path>
<path stroke="#244F46" stroke-width="1.5" data-bind="d:tsX"></path>
<path stroke="#9D5C3E" stroke-width="1.5" data-bind="d:tsY"></path>
</g>
</svg>
</div>
<div>
<ul class="fig-legend">
<li><span class="sw c-ink"></span>stochastic path</li>
<li><span class="sw dash c-grey"></span>deterministic orbit</li>
</ul>
<svg viewBox="0 0 420 280" role="img" aria-label="Predator against prey: a closed deterministic orbit and a stochastic path that wanders between orbits.">
<defs><clipPath id="lvPh"><rect x="44" y="12" width="364" height="228"></rect></clipPath></defs>
<path d="M44 12V240H408" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="end">
<text x="36" y="244">0</text><text x="36" y="130">1</text><text x="36" y="16">2</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="middle">
<text x="44" y="258">0</text><text x="135" y="258">1</text><text x="226" y="258">2</text><text x="317" y="258">3</text><text x="408" y="258">4</text>
</g>
<g font-family="IBM Plex Sans, sans-serif" font-size="12" fill="#657061">
<text x="408" y="276" text-anchor="end">prey</text>
<text x="52" y="24">predator</text>
</g>
<g clip-path="url(#lvPh)" fill="none" stroke-linejoin="round">
<path stroke="#A3ACA0" stroke-width="1.4" stroke-dasharray="4 3" data-bind="d:phDet"></path>
<path stroke="#203D36" stroke-width="1.2" data-bind="d:ph"></path>
</g>
<circle r="4" fill="#9D5C3E" data-bind="cx:headX; cy:headY"></circle>
</svg>
</div>
</div>
<div class="fig-controls">
<label class="fig-slider"><span>Noise \(\sigma\) <span class="v" data-text="sigLabel"></span></span>
<input type="range" min="0" max="0.15" step="0.005" aria-label="noise sigma" data-bind="value:sigma" data-on="input:setSigma"></label>
<div class="fig-actions"><button type="button" class="fig-btn solid" data-on="click:again">New path</button></div>
</div>
<p class="fig-status quiet" data-show="zeroNoise" role="status">At \(\sigma = 0\) Milstein reduces to Euler, so any drift away from the Runge–Kutta orbit is discretisation error.</p>
<figcaption class="fig-caption">Parameters \(\beta_1 = \beta_2 = 0.75\), \(\alpha_1 = 1\), \(\alpha_2 = 0.5\), step \(h = 0.005\), starting from \((1, 1)\). The two noise terms commute, so Milstein needs no Lévy areas; the deterministic reference uses Runge–Kutta.</figcaption>
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
        sigma: st.sigma, sigLabel: st.sigma.toFixed(3), zeroNoise: st.sigma === 0,
        setSigma: function (e) { var v = parseFloat(e.target.value); self.simulate(v); self.setState({ sigma: v }); },
        again: function () { var sd = st.seed + 1; self.noise(sd); self.simulate(st.sigma); self.setState({ seed: sd }); self.play(); }
      };
    }
  }

  SiteFigures.register('lv', { markup: markup, Component: Component });
})();
