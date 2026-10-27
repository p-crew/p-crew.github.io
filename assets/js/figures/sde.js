/* Interactive figure: strong convergence of SDE schemes. Loaded on demand by script.js. */
(function () {
  'use strict';

  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(n) { return String(n).replace(/./g, function (ch) { return SUP[ch]; }); }

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">Strong convergence of Euler–Maruyama and Milstein</p>
<p class="fig-lead">Geometric Brownian motion has an explicit solution, so the error of each scheme can be measured path by path. Halving the step size halves the Milstein error, but reduces the Euler–Maruyama error only by a factor of about \(\sqrt{2}\).</p>
</div>
<ul class="fig-legend">
<li><span class="sw c-ink"></span>exact</li>
<li><span class="sw c-rust"></span>Euler–Maruyama</li>
<li><span class="sw c-teal-light"></span>Milstein</li>
</ul>
<div class="fig-plots">
<div>
<p class="fig-label">One Brownian path at the current step size</p>
<svg viewBox="0 0 420 280" role="img" aria-label="One Brownian path: the exact solution and the two numerical approximations with the current step size.">
<g data-for="pathTicks" data-as="t" data-tpl="&lt;line x1=&quot;44&quot; x2=&quot;404&quot; y1=&quot;{{t.y}}&quot; y2=&quot;{{t.y}}&quot; stroke=&quot;#EDF0E7&quot;&gt;&lt;/line&gt;&lt;text x=&quot;36&quot; y=&quot;{{t.ty}}&quot; font-family=&quot;IBM Plex Mono, monospace&quot; font-size=&quot;12&quot; fill=&quot;#657061&quot; text-anchor=&quot;end&quot;&gt;{{t.label}}&lt;/text&gt;"></g>
<path d="M44 20V240H404" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="middle">
<text x="44" y="258">0</text><text x="224" y="258">0.5</text><text x="404" y="258">1</text>
</g>
<text x="404" y="276" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="#657061" text-anchor="end">t</text>
<path fill="none" stroke="#203D36" stroke-width="1.6" data-bind="d:exact"></path>
<path fill="none" stroke="#9D5C3E" stroke-width="1.8" stroke-linejoin="round" data-bind="d:em"></path>
<path fill="none" stroke="#3E8E7E" stroke-width="1.8" stroke-linejoin="round" data-bind="d:mil"></path>
</svg>
</div>
<div>
<p class="fig-label">Strong error \(\mathbb{E}\,|X_1 - X^h_1|\) over 400 paths</p>
<svg viewBox="0 0 420 280" role="img" aria-label="Log-log plot of strong error against step size: Euler–Maruyama follows slope one half and Milstein follows slope one.">
<g data-for="yTicks" data-as="t" data-tpl="&lt;line x1=&quot;44&quot; x2=&quot;404&quot; y1=&quot;{{t.y}}&quot; y2=&quot;{{t.y}}&quot; stroke=&quot;#EDF0E7&quot;&gt;&lt;/line&gt;&lt;text x=&quot;36&quot; y=&quot;{{t.ty}}&quot; font-family=&quot;IBM Plex Mono, monospace&quot; font-size=&quot;12&quot; fill=&quot;#657061&quot; text-anchor=&quot;end&quot;&gt;{{t.label}}&lt;/text&gt;"></g>
<path d="M44 20V240H404" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="middle">
<text x="44" y="258">2⁻⁸</text><text x="249.7" y="258">2⁻⁴</text><text x="404" y="258">2⁻¹</text>
</g>
<text x="404" y="276" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="#657061" text-anchor="end">h</text>
<path fill="none" stroke="#A3ACA0" stroke-width="1.2" stroke-dasharray="4 4" data-bind="d:refHalf"></path>
<path fill="none" stroke="#A3ACA0" stroke-width="1.2" stroke-dasharray="4 4" data-bind="d:refOne"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061">
<text data-bind="x:rhx; y:rhy">slope ½</text>
<text data-bind="x:r1x; y:r1y">slope 1</text>
</g>
<path fill="none" stroke="#9D5C3E" stroke-width="2" data-bind="d:errEM"></path>
<path fill="none" stroke="#3E8E7E" stroke-width="2" data-bind="d:errMil"></path>
<g data-for="dots" data-as="d" data-tpl="&lt;circle cx=&quot;{{d.x}}&quot; cy=&quot;{{d.y}}&quot; r=&quot;{{d.r}}&quot; fill=&quot;{{d.c}}&quot;&gt;&lt;/circle&gt;"></g>
</svg>
</div>
</div>
<div class="fig-controls">
<label class="fig-slider"><span>Step size \(h\) <span class="v" data-text="hLabel"></span></span>
<input type="range" min="1" max="8" step="1" aria-label="step size exponent" data-bind="value:k" data-on="input:setK"></label>
<label class="fig-slider"><span>Volatility \(\sigma\) <span class="v" data-text="sigLabel"></span></span>
<input type="range" min="0.2" max="1.5" step="0.05" aria-label="volatility sigma" data-bind="value:sigma" data-on="input:setSigma"></label>
</div>
<figcaption class="fig-caption">\(\mathrm{d}X_t = X_t\,\mathrm{d}t + \sigma X_t\,\mathrm{d}W_t\) on \([0, 1]\) with \(X_0 = 1\). Milstein adds the correction \(\tfrac12\sigma^2 X_n(\Delta W_n^2 - h)\) to Euler–Maruyama; both schemes use the same Brownian increments as the exact solution.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { k: 4, sigma: 0.8 };
      this.N = 256;
      this.M = 400;
      var r = this.rng(17), N = this.N, sq = Math.sqrt(1 / N);
      this.dW = [];
      for (var m = 0; m < this.M; m++) {
        var row = new Float64Array(N);
        for (var i = 0; i < N; i++) row[i] = sq * Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
        this.dW.push(row);
      }
      this.errors(0.8);
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
    schemes(dW, k, sigma) {
      var mu = 1, N = this.N, stride = N >> k, h = 1 / (1 << k), em = [1], mil = [1], xe = 1, xm = 1;
      for (var n = 0; n < (1 << k); n++) {
        var w = 0;
        for (var i = n * stride; i < (n + 1) * stride; i++) w += dW[i];
        xe = xe * (1 + mu * h + sigma * w);
        xm = xm * (1 + mu * h + sigma * w + 0.5 * sigma * sigma * (w * w - h));
        em.push(xe);
        mil.push(xm);
      }
      return { em: em, mil: mil };
    }
    errors(sigma) {
      var out = { em: [], mil: [] }, mu = 1;
      for (var k = 1; k <= 8; k++) {
        var se = 0, sm = 0;
        for (var m = 0; m < this.M; m++) {
          var W = 0, row = this.dW[m];
          for (var i = 0; i < this.N; i++) W += row[i];
          var exact = Math.exp(mu - 0.5 * sigma * sigma + sigma * W), s = this.schemes(row, k, sigma);
          se += Math.abs(exact - s.em[s.em.length - 1]);
          sm += Math.abs(exact - s.mil[s.mil.length - 1]);
        }
        out.em.push(se / this.M);
        out.mil.push(sm / this.M);
      }
      this.err = out;
    }
    renderVals() {
      var self = this, st = this.state, k = st.k, sigma = st.sigma, N = this.N, mu = 1, row = this.dW[0];
      var ex = [1], W = 0;
      for (var i = 0; i < N; i++) { W += row[i]; ex.push(Math.exp((mu - 0.5 * sigma * sigma) * (i + 1) / N + sigma * W)); }
      var s = this.schemes(row, k, sigma), all = ex.concat(s.em, s.mil);
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      lo = Math.floor(lo * 2) / 2; hi = Math.ceil(hi * 2) / 2;
      if (hi - lo < 1) hi = lo + 1;
      var py = function (v) { return 240 - 220 * (v - lo) / (hi - lo); };
      var step = [0.5, 1, 2, 5, 10].filter(function (sz) { return (hi - lo) / sz <= 5; })[0] || 20, pathTicks = [];
      for (var v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) pathTicks.push({ y: py(v).toFixed(1), ty: (py(v) + 4).toFixed(1), label: String(+v.toFixed(1)) });
      var line = function (arr) {
        var d = '', n = arr.length - 1;
        for (var j = 0; j <= n; j++) d += (j ? 'L' : 'M') + (44 + 360 * j / n).toFixed(1) + ' ' + py(arr[j]).toFixed(1);
        return d;
      };
      var e = this.err, logs = e.em.concat(e.mil).map(function (v) { return Math.log(v) / Math.LN10; });
      var elo = Math.floor(Math.min.apply(null, logs)), ehi = Math.ceil(Math.max.apply(null, logs));
      var ex2 = function (kk) { return 404 - 360 * (kk - 1) / 7; };
      var ey = function (v) { return 240 - 220 * (Math.log(v) / Math.LN10 - elo) / (ehi - elo); };
      var poly = function (arr) { var d = ''; for (var j = 0; j < 8; j++) d += (j ? 'L' : 'M') + ex2(j + 1).toFixed(1) + ' ' + ey(arr[j]).toFixed(1); return d; };
      var ref = function (v0, order) { var v8 = v0 * Math.pow(2, -7 * order); return 'M' + ex2(1).toFixed(1) + ' ' + (ey(v0) - 14).toFixed(1) + 'L' + ex2(8).toFixed(1) + ' ' + (ey(v8) - 14).toFixed(1); };
      var refY = function (v0, order, x) { var yl = ey(v0 * Math.pow(2, -7 * order)) - 14, yr = ey(v0) - 14; return yl + (yr - yl) * (x - 44) / 360; };
      var ticks = [];
      for (var p = elo; p <= ehi; p++) { var yy = 240 - 220 * (p - elo) / (ehi - elo); ticks.push({ y: yy.toFixed(1), ty: (yy + 4).toFixed(1), label: '10' + sup(p) }); }
      var dots = [];
      for (var j = 0; j < 8; j++) {
        var on = j + 1 === k;
        dots.push({ x: ex2(j + 1).toFixed(1), y: ey(e.em[j]).toFixed(1), r: on ? 5 : 3, c: '#9D5C3E' });
        dots.push({ x: ex2(j + 1).toFixed(1), y: ey(e.mil[j]).toFixed(1), r: on ? 5 : 3, c: '#3E8E7E' });
      }
      return {
        exact: line(ex), em: line(s.em), mil: line(s.mil),
        pathTicks: pathTicks,
        errEM: poly(e.em), errMil: poly(e.mil), yTicks: ticks, dots: dots,
        refHalf: ref(e.em[0], 0.5), refOne: ref(e.mil[0], 1),
        // Slope labels sit above the left (small h) end of each reference line, clear of it.
        rhx: '50', rhy: (refY(e.em[0], 0.5, 106) - 5).toFixed(1),
        r1x: '50', r1y: (refY(e.mil[0], 1, 106) - 5).toFixed(1),
        kx: ex2(k).toFixed(1), k: k, hLabel: '2' + sup(-k) + ' = ' + (1 / (1 << k)).toString(),
        sigma: sigma, sigLabel: sigma.toFixed(2),
        setK: function (ev) { self.setState({ k: parseInt(ev.target.value, 10) }); },
        setSigma: function (ev) { var v = parseFloat(ev.target.value); self.errors(v); self.setState({ sigma: v }); }
      };
    }
  }

  SiteFigures.register('sde', { markup: markup, Component: Component });
})();
