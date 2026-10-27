/* Interactive figure: autologistic correction by Gibbs sampling. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">Spatial correction of fire probabilities</p>
<p class="fig-lead">A random forest gives each site a fire probability \(p_i\) independently of its neighbours. The autologistic model adds a neighbour interaction, \(\operatorname{logit} q_i = \operatorname{logit} p_i + \beta\sum_{j \sim i} x_j\), and Gibbs sampling estimates the corrected probabilities.</p>
</div>
<ul class="fig-legend">
<li><span class="sw ramp"></span>probability 0 to 0.8</li>
<li><span class="sw box c-ink"></span>burning</li>
</ul>
<div class="fig-plots" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr))">
<div>
<p class="fig-label">Random-forest probabilities \(p_i\)</p>
<canvas width="240" height="240" role="img" aria-label="Heat map of the base fire probabilities." style="aspect-ratio: 1 / 1" data-ref="setP"></canvas>
</div>
<div>
<p class="fig-label">Current Gibbs sample \(\mathbf{x}\)</p>
<canvas width="240" height="240" role="img" aria-label="The current sample from the autologistic model; burning cells are dark." style="aspect-ratio: 1 / 1" data-ref="setX"></canvas>
</div>
<div>
<p class="fig-label">Corrected probabilities (Gibbs mean)</p>
<canvas width="240" height="240" role="img" aria-label="Heat map of the running Gibbs mean, the spatially corrected probabilities." style="aspect-ratio: 1 / 1" data-ref="setM"></canvas>
</div>
</div>
<div class="fig-controls">
<label class="fig-slider"><span>Interaction \(\beta\) <span class="v" data-text="betaLabel"></span></span>
<input type="range" min="0" max="1.2" step="0.02" aria-label="interaction beta" data-bind="value:beta" data-on="input:setBeta"></label>
<div class="fig-actions"><button type="button" class="fig-btn solid" data-on="click:toggle"><span data-text="toggleLabel"></span></button></div>
</div>
<dl class="fig-readout">
<div><dt>Mean \(p_i\)</dt><dd data-text="meanP"></dd></div>
<div><dt>Mean corrected</dt><dd data-text="meanQ"></dd></div>
<div><dt>Sweeps</dt><dd data-text="sweeps"></dd></div>
</dl>
<figcaption class="fig-caption">A synthetic 40 × 40 grid with four-neighbour interactions; the corrected map averages the samples after 20 burn-in sweeps. In the project \(\beta\) was fitted by pseudo-likelihood and an approximate likelihood ratio.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { beta: 0.6, running: true, tick: 0 };
      var self = this;
      this.n = 40;
      this.cv = {};
      this.setP = function (el) { self.cv.p = el; self.draw(); };
      this.setX = function (el) { self.cv.x = el; self.draw(); };
      this.setM = function (el) { self.cv.m = el; self.draw(); };
      var n = this.n, bumps = [[12, 14, 3.2, 5], [28, 26, 2.8, 6], [30, 9, 2.2, 4]];
      this.logitP = new Float64Array(n * n);
      this.p = new Float64Array(n * n);
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
        var l = -2.6;
        for (var b = 0; b < bumps.length; b++) {
          var dx = i - bumps[b][0], dy = j - bumps[b][1];
          l += bumps[b][2] * Math.exp(-(dx * dx + dy * dy) / (2 * bumps[b][3] * bumps[b][3]));
        }
        this.logitP[i * n + j] = l;
        this.p[i * n + j] = 1 / (1 + Math.exp(-l));
      }
      this.seed = 7;
    }
    rng() {
      var a = (this.seed = (this.seed + 0x6D2B79F5) | 0);
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    reset() {
      var N = this.n * this.n;
      this.x = new Uint8Array(N);
      for (var k = 0; k < N; k++) this.x[k] = this.rng() < this.p[k] ? 1 : 0;
      this.sum = new Float64Array(N);
      this.count = 0;
      this.sweepCount = 0;
    }
    sweep() {
      var n = this.n, x = this.x, beta = this.state.beta;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
        var s = 0;
        if (i > 0) s += x[(i - 1) * n + j];
        if (i < n - 1) s += x[(i + 1) * n + j];
        if (j > 0) s += x[i * n + j - 1];
        if (j < n - 1) s += x[i * n + j + 1];
        var q = 1 / (1 + Math.exp(-(this.logitP[i * n + j] + beta * s)));
        x[i * n + j] = this.rng() < q ? 1 : 0;
      }
      this.sweepCount += 1;
      if (this.sweepCount > 20) {
        for (var k = 0; k < n * n; k++) this.sum[k] += x[k];
        this.count += 1;
      }
    }
    heat(v) {
      var u = Math.max(0, Math.min(1, v / 0.8));
      return 'rgb(' + Math.round(237 + (157 - 237) * u) + ',' + Math.round(240 + (92 - 240) * u) + ',' + Math.round(231 + (62 - 231) * u) + ')';
    }
    draw() {
      if (!this.x) return;
      var n = this.n, cs = 6, self = this;
      var paint = function (el, colour) {
        if (!el) return;
        var ctx = el.getContext('2d');
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { ctx.fillStyle = colour(i * n + j); ctx.fillRect(j * cs, i * cs, cs, cs); }
      };
      paint(this.cv.p, function (k) { return self.heat(self.p[k]); });
      paint(this.cv.x, function (k) { return self.x[k] ? '#203D36' : '#F6F5EF'; });
      paint(this.cv.m, function (k) { return self.heat(self.count ? self.sum[k] / self.count : self.p[k]); });
    }
    loop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      var self = this;
      var tick = function () {
        if (!self.state.running) return;
        self.sweep();
        self.draw();
        if (self.sweepCount >= 1500) { self.setState({ running: false, tick: self.sweepCount }); return; }
        self.setState({ tick: self.sweepCount });
        self.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
    componentDidMount() {
      this.reset();
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        for (var k = 0; k < 220; k++) this.sweep();
        this.draw();
        this.setState({ running: false, tick: this.sweepCount });
        return;
      }
      this.loop();
    }
    componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
    renderVals() {
      var self = this, st = this.state, N = this.n * this.n, mp = 0, mq = 0;
      for (var k = 0; k < N; k++) { mp += this.p[k]; mq += this.count ? this.sum[k] / this.count : this.p[k]; }
      return {
        setP: this.setP, setX: this.setX, setM: this.setM,
        beta: st.beta, betaLabel: st.beta.toFixed(2),
        meanP: (mp / N).toFixed(3), meanQ: this.count ? (mq / N).toFixed(3) : '…',
        sweeps: String(this.sweepCount || 0),
        toggleLabel: st.running ? 'Pause' : 'Resume',
        setBeta: function (e) {
          var b = parseFloat(e.target.value);
          self.setState({ beta: b, running: true }, function () { self.reset(); self.loop(); });
        },
        toggle: function () {
          if (st.running) { if (self.raf) cancelAnimationFrame(self.raf); self.setState({ running: false }); }
          else self.setState({ running: true }, function () { if (self.sweepCount >= 1500) self.reset(); self.loop(); });
        }
      };
    }
  }

  SiteFigures.register('wildfire', { markup: markup, Component: Component });
})();
