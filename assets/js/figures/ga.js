/* Interactive figure: geographic atrophy lattice model. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">Lesion growth in geographic atrophy</p>
<p class="fig-lead">Each cell of a hexagonal lattice accumulates stress \(\sigma_i\) from its dead neighbours (\(S_j = 1\)) and dies once the stress passes its threshold \(\theta_i\). Stress is cleared faster as the lesion area \(A(t)\) grows:</p>
<div class="fig-eq">\[\begin{aligned} \frac{\mathrm{d}\sigma_i}{\mathrm{d}t} &= -\gamma(t)\,\sigma_i + \beta\sum_{j \in \mathcal{N}_i} S_j + D\,\Delta\sigma_i, \\ \gamma(t) &= \gamma_0\,\frac{|\Omega|}{1 + |\Omega| - A(t)}. \end{aligned}\]</div>
</div>
<div class="fig-plots">
<div>
<ul class="fig-legend">
<li><span class="sw box c-ink"></span>dead</li>
<li><span class="sw ramp"></span>stress \(\sigma_i/\theta_i\)</li>
</ul>
<canvas width="560" height="560" role="img" aria-label="Hexagonal lattice of cells; the lesion of dead cells grows from the centre and is surrounded by a band of stressed cells." style="max-width: 560px; aspect-ratio: 1 / 1; background: #F6F5EF" data-ref="setCanvas"></canvas>
</div>
<div>
<p class="fig-label">Lesion area \(A(t)/|\Omega|\); earlier runs in grey, labelled by \(\theta\)</p>
<svg viewBox="0 0 580 300" role="img" aria-label="Lesion area fraction against time for the current run and for previous runs at other thresholds.">
<line x1="44" x2="504" y1="140" y2="140" stroke="#EDF0E7"></line>
<path d="M44 20V260H504" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="16" fill="#657061" text-anchor="end">
<text x="36" y="264">0</text><text x="36" y="144">0.5</text><text x="36" y="24">1</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="16" fill="#657061" text-anchor="middle">
<text x="44" y="280">0</text><text x="274" y="280">2500</text><text x="504" y="280">5000</text>
</g>
<text x="274" y="298" font-family="IBM Plex Sans, sans-serif" font-size="16" fill="#657061" text-anchor="middle">time steps</text>
<g data-for="history" data-as="h" data-tpl="&lt;path d=&quot;{{h.d}}&quot; fill=&quot;none&quot; stroke=&quot;#A3ACA0&quot; stroke-width=&quot;1.4&quot;&gt;&lt;/path&gt;&lt;text x=&quot;512&quot; y=&quot;{{h.ly}}&quot; font-family=&quot;IBM Plex Mono, monospace&quot; font-size=&quot;16&quot; fill=&quot;#657061&quot;&gt;{{h.label}}&lt;/text&gt;"></g>
<path fill="none" stroke="#9D5C3E" stroke-width="2.4" data-bind="d:curPath"></path>
</svg>
<div class="fig-controls" style="grid-template-columns: minmax(0, 1fr)">
<label class="fig-slider"><span>Death threshold \(\theta\) <span class="v" data-text="thetaLabel"></span></span>
<input type="range" min="0.6" max="1.6" step="0.02" aria-label="death threshold theta" data-bind="value:theta" data-on="input:setTheta"></label>
<div class="fig-actions">
<button type="button" class="fig-btn solid" data-on="click:toggle"><span data-text="toggleLabel"></span></button>
<button type="button" class="fig-btn" data-on="click:restart">Restart</button>
</div>
</div>
<dl class="fig-readout">
<div><dt>Step \(t\)</dt><dd data-text="tLabel"></dd></div>
<div><dt>Lesion area \(A/|\Omega|\)</dt><dd data-text="aLabel"></dd></div>
</dl>
</div>
</div>
<figcaption class="fig-caption">Thresholds \(\theta_i\) are drawn within 15% of \(\theta\). Near \(\theta \approx 1.15\) the final lesion size jumps, the phase transition found in the project. Illustrative parameters \(\beta = 0.03\), \(\gamma_0 = 0.005\), \(D = 0.15\).</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { theta: 1.0, running: true, tick: 0, history: [] };
      this.lattice = this.build(34);
      this.runs = 0;
      var self = this;
      this.setCanvas = function (el) { self.canvas = el; if (el) self.draw(); };
    }
    build(R) {
      var cells = [], index = {}, nbr = [];
      for (var q = -R; q <= R; q++) for (var r = -R; r <= R; r++) {
        var x = Math.sqrt(3) * (q + r / 2), y = 1.5 * r;
        if (x * x + y * y <= 2.25 * R * R) { index[q + ',' + r] = cells.length; cells.push({ q: q, r: r, x: x, y: y }); }
      }
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
      for (var i = 0; i < cells.length; i++) {
        var list = [];
        for (var d = 0; d < 6; d++) { var j = index[(cells[i].q + dirs[d][0]) + ',' + (cells[i].r + dirs[d][1])]; if (j !== undefined) list.push(j); }
        nbr.push(list);
      }
      return { cells: cells, nbr: nbr, n: cells.length, R: R };
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
    reset(theta) {
      var n = this.lattice.n;
      this.runs += 1;
      this.r = this.rng(1000 + this.runs);
      this.S = new Uint8Array(n); this.sig = new Float64Array(n); this.next = new Float64Array(n); this.th = new Float64Array(n);
      for (var i = 0; i < n; i++) this.th[i] = theta * (1 + 0.15 * (this.r() * 2 - 1));
      this.A = 0; this.t = 0; this.samples = [0]; this.runTheta = theta;
    }
    step() {
      var L = this.lattice, n = L.n, S = this.S, sig = this.sig, next = this.next, beta = 0.03, D = 0.15;
      var g = 0.005 * n / (1 + n - this.A);
      for (var i = 0; i < n; i++) {
        if (S[i]) continue;
        var dead = 0, lap = 0, nb = L.nbr[i];
        for (var m = 0; m < nb.length; m++) { var j = nb[m]; dead += S[j]; if (!S[j]) lap += sig[j] - sig[i]; }
        next[i] = Math.max(0, sig[i] + (-g * sig[i] + beta * dead + D * lap));
      }
      for (var k = 0; k < n; k++) {
        if (S[k]) continue;
        sig[k] = next[k];
        var c = L.cells[k], seed = c.x * c.x + c.y * c.y <= 81;
        if (sig[k] > this.th[k] || (seed && this.r() < 0.002)) { S[k] = 1; sig[k] = 0; this.A += 1; }
      }
      this.t += 1;
      if (this.t % 25 === 0) this.samples.push(this.A / n);
    }
    draw() {
      var cv = this.canvas;
      if (!cv || !this.S) return;
      var ctx = cv.getContext('2d'), L = this.lattice, W = cv.width, s = W / (3 * L.R + 4), cx = W / 2, cy = cv.height / 2;
      ctx.fillStyle = '#F6F5EF'; ctx.fillRect(0, 0, W, cv.height);
      var hx = [], hy = [];
      for (var a = 0; a < 6; a++) { var ang = Math.PI / 6 + a * Math.PI / 3; hx.push(Math.cos(ang) * s * 0.98); hy.push(Math.sin(ang) * s * 0.98); }
      for (var i = 0; i < L.n; i++) {
        var c = L.cells[i], px = cx + c.x * s, py = cy + c.y * s;
        if (this.S[i]) ctx.fillStyle = '#203D36';
        else {
          var u = Math.min(1, this.sig[i] / this.runTheta);
          ctx.fillStyle = 'rgb(' + Math.round(157 + (237 - 157) * (1 - u)) + ',' + Math.round(92 + (240 - 92) * (1 - u)) + ',' + Math.round(62 + (231 - 62) * (1 - u)) + ')';
        }
        ctx.beginPath();
        ctx.moveTo(px + hx[0], py + hy[0]);
        for (var b = 1; b < 6; b++) ctx.lineTo(px + hx[b], py + hy[b]);
        ctx.closePath(); ctx.fill();
      }
    }
    loop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      var self = this;
      var tick = function () {
        if (!self.state.running) return;
        for (var k = 0; k < 20 && self.t < 5000; k++) self.step();
        self.draw();
        if (self.t >= 5000) {
          var hist = self.state.history.concat([{ theta: self.runTheta, samples: self.samples.slice() }]).slice(-6);
          self.setState({ running: false, tick: self.t, history: hist });
          return;
        }
        self.setState({ tick: self.t });
        self.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
    componentDidMount() {
      this.reset(this.state.theta);
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        while (this.t < 5000) this.step();
        this.draw();
        this.setState({ running: false, tick: this.t, history: [{ theta: this.runTheta, samples: this.samples.slice() }] });
        return;
      }
      this.loop();
    }
    componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
    curve(samples) {
      var d = '';
      for (var i = 0; i < samples.length; i++) d += (i ? 'L' : 'M') + (44 + 460 * i * 25 / 5000).toFixed(1) + ' ' + (260 - 240 * samples[i]).toFixed(1);
      return d;
    }
    // End-of-run labels sit right of the plot, spaced so they never overlap.
    labelled(history) {
      var self = this, out = history.map(function (h) {
        return { d: self.curve(h.samples), label: 'θ ' + h.theta.toFixed(2), y: 264 - 240 * h.samples[h.samples.length - 1] };
      });
      var order = out.slice().sort(function (a, b) { return a.y - b.y; });
      for (var i = 1; i < order.length; i++) order[i].y = Math.max(order[i].y, order[i - 1].y + 18);
      for (var j = order.length - 1; j >= 0; j--) order[j].y = Math.min(order[j].y, j === order.length - 1 ? 292 : order[j + 1].y - 18);
      out.forEach(function (h) { h.ly = h.y.toFixed(1); });
      return out;
    }
    renderVals() {
      var self = this, st = this.state, samples = this.samples || [0];
      var restartWith = function (theta) {
        self.reset(theta);
        self.setState({ theta: theta, running: true, tick: 0 }, function () { self.loop(); });
      };
      return {
        setCanvas: this.setCanvas,
        curPath: this.curve(samples),
        history: this.labelled(st.history),
        theta: st.theta, thetaLabel: st.theta.toFixed(2),
        tLabel: String(this.t || 0), aLabel: (samples[samples.length - 1] || 0).toFixed(3),
        toggleLabel: st.running ? 'Pause' : (this.t >= 5000 ? 'Run again' : 'Resume'),
        setTheta: function (e) { restartWith(parseFloat(e.target.value)); },
        restart: function () { restartWith(st.theta); },
        toggle: function () {
          if (st.running) { if (self.raf) cancelAnimationFrame(self.raf); self.setState({ running: false }); }
          else if (self.t >= 5000) restartWith(st.theta);
          else self.setState({ running: true }, function () { self.loop(); });
        }
      };
    }
  }

  SiteFigures.register('ga', { markup: markup, Component: Component });
})();
