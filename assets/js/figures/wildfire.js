/* Interactive figure: autologistic correction by Gibbs sampling. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<p style="margin: 0; font-size: 14px; color: #515C55">\(\operatorname{logit} q_i = \operatorname{logit} p_i + \beta \sum_{j \sim i} x_j\), on a 4-neighbour grid</p>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 20px; margin-top: 16px">
<div>
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Random-forest probabilities \(p_i\)</p>
<canvas width="240" height="240" role="img" aria-label="Heat map of the base fire probabilities." style="display: block; width: 100%; height: auto; aspect-ratio: 1 / 1" data-ref="setP"></canvas>
</div>
<div>
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Current Gibbs sample \(\mathbf{x}\)</p>
<canvas width="240" height="240" role="img" aria-label="The current sample from the autologistic model; burning cells are dark." style="display: block; width: 100%; height: auto; aspect-ratio: 1 / 1" data-ref="setX"></canvas>
</div>
<div>
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Corrected probabilities (Gibbs mean)</p>
<canvas width="240" height="240" role="img" aria-label="Heat map of the running Gibbs mean, the spatially corrected probabilities." style="display: block; width: 100%; height: auto; aspect-ratio: 1 / 1" data-ref="setM"></canvas>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 16px 32px; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #EDF0E7">
<label style="flex: 1 1 240px; display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55">
<span>interaction \(\beta =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="betaLabel"></span></span></span>
<input type="range" min="0" max="1.2" step="0.02" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:beta" data-on="input:setBeta">
</label>
<span style="font-size: 13px; color: #515C55">mean of \(p_i\): <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="meanP"></span></span><br>mean of corrected: <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="meanQ"></span></span></span>
<span style="font-size: 13px; color: #515C55">sweeps: <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="sweeps"></span></span></span>
<button type="button" style="font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid #244F46; background: #244F46; color: #FFFFFF; font-size: 14px" data-on="click:toggle"><span data-text="toggleLabel"></span></button>
</div>
<figcaption style="margin-top: 14px; font-size: 14px; color: #515C55">The random forest treats sites as independent. The autologistic model adds a neighbour interaction \(\beta\) to each site's conditional log-odds, and a systematic-scan Gibbs sampler, started from independent draws, estimates the corrected probabilities as the mean of the samples after burn-in (20 sweeps here). Synthetic probabilities on a 40 × 40 grid; in the project \(\beta\) was fitted by pseudo-likelihood and an approximate likelihood ratio.</figcaption>
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
