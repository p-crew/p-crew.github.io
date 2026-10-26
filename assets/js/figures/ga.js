/* Interactive figure: geographic atrophy lattice model. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<p style="margin: 0 0 16px; font-size: 14px; color: #515C55">\(\displaystyle \frac{\mathrm{d}\sigma_i}{\mathrm{d}t} = -\gamma(t)\,\sigma_i + \beta\sum_{j \in \mathcal{N}_i} S_j + D\,\Delta\sigma_i, \qquad \gamma(t) = \gamma_0\,\frac{|\Omega|}{1 + |\Omega| - A(t)}\)</p>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 24px; align-items: start">
<div>
<p style="margin: 0 0 8px; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; color: #515C55"><span style="display: inline-block; width: 10px; height: 10px; background: #203D36"></span> dead   <span style="display: inline-block; width: 10px; height: 10px; background: #9D5C3E"></span> stress near threshold</p>
<canvas width="560" height="560" role="img" aria-label="Hexagonal lattice of cells; the lesion of dead cells grows from the centre and is surrounded by a band of stressed cells." style="display: block; width: 100%; max-width: 560px; height: auto; aspect-ratio: 1 / 1; background: #F6F5EF" data-ref="setCanvas"></canvas>
</div>
<div style="min-width: 0">
<p style="margin: 0 0 8px; font-size: 13px; color: #515C55">lesion area \(A(t)/|\Omega|\); grey: finished runs, labelled by \(\theta\)</p>
<svg viewBox="0 0 520 300" role="img" aria-label="Lesion area fraction against time for the current run and for previous runs at other thresholds." style="display: block; width: 100%; height: auto">
<line x1="44" x2="504" y1="20" y2="20" stroke="#EDF0E7"></line>
<line x1="44" x2="504" y1="140" y2="140" stroke="#EDF0E7"></line>
<line x1="44" x2="504" y1="260" y2="260" stroke="#B8C1B6"></line>
<line x1="44" x2="44" y1="20" y2="260" stroke="#B8C1B6"></line>
<text x="36" y="24" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">1</text>
<text x="36" y="144" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0.5</text>
<text x="36" y="264" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0</text>
<text x="44" y="280" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">0</text>
<text x="274" y="280" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">2500</text>
<text x="504" y="280" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">5000</text>
<text x="504" y="296" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">t</text>
<g data-for="history" data-as="h" data-tpl="&lt;path d=&quot;{{h.d}}&quot; fill=&quot;none&quot; stroke=&quot;#A3ACA0&quot; stroke-width=&quot;1.3&quot;&gt;&lt;/path&gt;&lt;text x=&quot;{{h.lx}}&quot; y=&quot;{{h.ly}}&quot; font-family=&quot;IBM Plex Mono, monospace&quot; font-size=&quot;10&quot; fill=&quot;#657061&quot;&gt;{{h.label}}&lt;/text&gt;"></g>
<path fill="none" stroke="#9D5C3E" stroke-width="2.2" data-bind="d:curPath"></path>
</svg>
<div style="display: grid; gap: 12px; margin-top: 16px">
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #515C55">
<span>death threshold \(\theta =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="thetaLabel"></span></span></span>
<input type="range" min="0.6" max="1.6" step="0.02" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:theta" data-on="input:setTheta">
</label>
<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
<button type="button" style="font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid #244F46; background: #244F46; color: #FFFFFF; font-size: 14px" data-on="click:toggle"><span data-text="toggleLabel"></span></button>
<button type="button" style="font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid #B8C1B6; background: #FFFFFF; color: #203D36; font-size: 14px" data-on="click:restart">Restart</button>
<span style="font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #515C55">\(t =\) <span data-text="tLabel"></span>   \(A/|\Omega| =\) <span data-text="aLabel"></span></span>
</div>
</div>
</div>
</div>
<figcaption style="margin-top: 18px; font-size: 14px; color: #515C55">A cell dies once \(\sigma_i\) exceeds its threshold \(\theta_i\); the "waste removal" decay rate \(\gamma(t)\) grows with the lesion area \(A(t)\). This is a reimplementation of the team's model, run in your browser. Thresholds \(\theta_i\) are drawn uniformly within 15% of \(\theta\), and cells near the centre also die spontaneously at a small rate. Try runs either side of \(\theta \approx 1.15\): the final lesion area changes abruptly there, as in the phase transition found in the project. Parameters are illustrative (\(\beta = 0.03\), \(\gamma_0 = 0.005\), \(D = 0.15\)), so the critical \(\theta\) differs from the original slides.</figcaption>
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
    renderVals() {
      var self = this, st = this.state, samples = this.samples || [0];
      var restartWith = function (theta) {
        self.reset(theta);
        self.setState({ theta: theta, running: true, tick: 0 }, function () { self.loop(); });
      };
      return {
        setCanvas: this.setCanvas,
        curPath: this.curve(samples),
        history: st.history.map(function (h) {
          var last = h.samples[h.samples.length - 1];
          return { d: self.curve(h.samples), label: 'θ=' + h.theta.toFixed(2), lx: 446, ly: (256 - 240 * last).toFixed(1) };
        }),
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
