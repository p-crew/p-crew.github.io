/* Interactive figure: rough driver recovery. Loaded on demand by script.js. */
(function () {
  'use strict';

  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(n) { return String(n).replace(/./g, function (ch) { return SUP[ch]; }); }
  // 0.0032 -> '3.2 × 10⁻³'
  function sci(v) {
    var p = Math.floor(Math.log10(v)), m = v / Math.pow(10, p);
    if (m >= 9.95) { m /= 10; p += 1; }
    return m.toFixed(1) + ' × 10' + sup(p);
  }
  // Typographic minus sign for negative numbers.
  function num(v, digits) { return v.toFixed(digits).replace(/^-(?=.*[1-9])/, '−').replace(/^-/, ''); }

  // f(y) = c + sin y + sin(2y)/2 has zeros exactly when c < 3√3/4, its minimum being at y = −π/3.
  var CSTAR = 3 * Math.sqrt(3) / 4;
  var DRIVER_SCALE = 3;

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">Recovering the driver from the solution</p>
<p class="fig-lead">For the scalar equation \(\mathrm{d}Y_t = f(Y_t)\,\mathrm{d}\mathbf{X}_t\) with \(f(y) = c + \sin y + \tfrac12\sin 2y\), the driver can be read back from noisy observations of the solution using \(\varphi' = 1/f\). Where \(f\) is small the solution barely moves, and the recovery amplifies observation noise by \(1/f(Y)\). When \(c &lt; 3\sqrt3/4 \approx 1.30\), \(f\) has zeros that the solution cannot cross.</p>
</div>
<div class="fig-plot">
<ul class="fig-legend">
<li><span class="sw c-ink"></span>driver \(X\)</li>
<li><span class="sw dash c-rust"></span>recovered \(\hat X_t = \varphi(Y^{\mathrm{obs}}_t) - \varphi(y_0)\)</li>
</ul>
<svg viewBox="0 0 720 170" role="img" aria-label="The Brownian driver and the driver recovered from noisy observations of the solution.">
<defs><clipPath id="cpX"><rect x="48" y="12" width="652" height="146"></rect></clipPath></defs>
<g data-for="xTicks" data-as="t" data-tpl="&lt;line x1=&quot;48&quot; x2=&quot;700&quot; y1=&quot;{{t.y}}&quot; y2=&quot;{{t.y}}&quot; stroke=&quot;#EDF0E7&quot;&gt;&lt;/line&gt;&lt;text x=&quot;40&quot; y=&quot;{{t.ty}}&quot; font-family=&quot;IBM Plex Mono, monospace&quot; font-size=&quot;12&quot; fill=&quot;#657061&quot; text-anchor=&quot;end&quot;&gt;{{t.label}}&lt;/text&gt;"></g>
<path d="M48 12V158" stroke="#B8C1B6"></path>
<g clip-path="url(#cpX)" fill="none" stroke-linejoin="round">
<path stroke="#203D36" stroke-width="1.6" data-bind="d:drvPath"></path>
<path stroke="#9D5C3E" stroke-width="1.4" stroke-dasharray="5 3" data-bind="d:recPath"></path>
<g data-for="invalidMarks" data-as="m" data-tpl="&lt;line x1=&quot;{{m.x}}&quot; x2=&quot;{{m.x}}&quot; y1=&quot;146&quot; y2=&quot;158&quot; stroke=&quot;#9D5C3E&quot; stroke-width=&quot;2&quot;&gt;&lt;/line&gt;"></g>
</g>
</svg>
</div>
<div class="fig-plot">
<ul class="fig-legend">
<li><span class="sw c-ink"></span>solution \(Y\)</li>
<li><span class="sw dash c-rust"></span>zeros of \(f\)</li>
</ul>
<svg viewBox="0 0 720 170" role="img" aria-label="The solution path, which cannot cross the zeros of the vector field.">
<defs><clipPath id="cpY"><rect x="48" y="12" width="652" height="146"></rect></clipPath></defs>
<g data-for="yTicks" data-as="t" data-tpl="&lt;line x1=&quot;48&quot; x2=&quot;700&quot; y1=&quot;{{t.y}}&quot; y2=&quot;{{t.y}}&quot; stroke=&quot;#EDF0E7&quot;&gt;&lt;/line&gt;&lt;text x=&quot;40&quot; y=&quot;{{t.ty}}&quot; font-family=&quot;IBM Plex Mono, monospace&quot; font-size=&quot;12&quot; fill=&quot;#657061&quot; text-anchor=&quot;end&quot;&gt;{{t.label}}&lt;/text&gt;"></g>
<path d="M48 12V158" stroke="#B8C1B6"></path>
<g data-for="zeroLines" data-as="z" data-tpl="&lt;line x1=&quot;48&quot; x2=&quot;700&quot; y1=&quot;{{z.y}}&quot; y2=&quot;{{z.y}}&quot; stroke=&quot;#9D5C3E&quot; stroke-width=&quot;1.2&quot; stroke-dasharray=&quot;5 4&quot;&gt;&lt;/line&gt;"></g>
<g clip-path="url(#cpY)" fill="none" stroke-linejoin="round">
<path stroke="#203D36" stroke-width="1.6" data-bind="d:solPath"></path>
</g>
</svg>
</div>
<div class="fig-controls">
<div>
<p class="fig-label">\(f\) on \([-\pi, \pi]\); shaded: values of \(Y\) modulo \(2\pi\)</p>
<svg viewBox="0 0 240 132" role="img" aria-label="The vector field f on minus pi to pi, with the range visited by the solution shaded." style="max-width: 240px">
<g data-for="bands" data-as="b" data-tpl="&lt;rect y=&quot;8&quot; height=&quot;100&quot; fill=&quot;#EDF0E7&quot; x=&quot;{{b.x}}&quot; width=&quot;{{b.w}}&quot;&gt;&lt;/rect&gt;"></g>
<line x1="20" x2="220" stroke="#B8C1B6" data-bind="y1:fZero; y2:fZero"></line>
<path fill="none" stroke="#244F46" stroke-width="2" data-bind="d:fPath"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061">
<text x="20" y="126" text-anchor="middle">−π</text>
<text x="120" y="126" text-anchor="middle">0</text>
<text x="220" y="126" text-anchor="middle">π</text>
<text x="14" text-anchor="end" data-bind="y:fZeroL">0</text>
</g>
</svg>
</div>
<div style="display: grid; gap: 10px">
<label class="fig-slider"><span>\(c\) <span class="v" data-text="cLabel"></span></span>
<input type="range" min="0.2" max="2.5" step="0.01" aria-label="c" data-bind="value:c" data-on="input:setC"></label>
<label class="fig-slider"><span>Observation noise <span class="v" data-text="noiseLabel"></span></span>
<input type="range" min="-4" max="-1.5" step="0.01" aria-label="observation noise, log scale" data-bind="value:logNoise" data-on="input:setNoise"></label>
</div>
<div class="fig-actions"><button type="button" class="fig-btn" data-on="click:newDriver">New driver</button></div>
</div>
<dl class="fig-readout">
<div><dt>\(\min_t f(Y_t)\)</dt><dd data-text="minF"></dd></div>
<div><dt>\(\max_t |\hat X_t - X_t|\)</dt><dd data-text="maxErr"></dd></div>
<div><dt>Not invertible</dt><dd data-text="invalidLabel"></dd></div>
</dl>
<p class="fig-status warn" data-show="hasInvalid" role="status">Some noisy observations lie on or beyond a zero of \(f\), where \(\varphi\) is undefined. They are shown as gaps (rust ticks) and left out of the error.</p>
<figcaption class="fig-caption">The recovery is \(X_t - X_0 = \varphi(Y_t) - \varphi(Y_0)\) on the interval around \(Y_0 = 0\) where \(f \ne 0\). Since \(f\) is not symmetric, the solution approaches the two zeros bounding this interval at different rates. The driver is \(X = 3B\) for a Brownian motion \(B\), and the flow of \(f\) is computed numerically.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { rSeed: 75, c: 1.6, logNoise: -2.5 };
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
    gauss(r) {
      var u = Math.max(r(), 1e-12), v = r();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    driver(seed) {
      if (this.drvCache && this.drvCache.seed === seed) return this.drvCache;
      var r = this.rng(seed * 7919 + 1), N = 500, X = [0], E = [];
      for (var i = 1; i <= N; i++) X.push(X[i - 1] + DRIVER_SCALE * Math.sqrt(1 / N) * this.gauss(r));
      for (var j = 0; j <= N; j++) E.push(this.gauss(r));
      this.drvCache = { seed: seed, X: X, E: E };
      return this.drvCache;
    }
    flow(c) {
      // Scalar flow Theta' = f(Theta), Theta(0) = 0, for f(y) = c + sin y + sin(2y)/2.
      // Theta is tabulated by RK4 and interpolated by cubic Hermite segments
      // (slopes f(Theta)); phi inverts the same interpolant, so theta(phi(y)) = y.
      // For c >= CSTAR one period of y is tabulated and extended by periodicity;
      // for c < CSTAR the table runs out to the zeros lo < 0 < hi around Theta(0).
      if (this.flowCache && this.flowCache.c === c) return this.flowCache;
      var f = function (y) { return c + Math.sin(y) + 0.5 * Math.sin(2 * y); };
      var trapped = c < CSTAR, lo = -Infinity, hi = Infinity, TWO_PI = 2 * Math.PI;
      // Bisection between a point where f > 0 and one where f < 0.
      var root = function (a, b) {
        for (var i = 0; i < 200; i++) { var m = (a + b) / 2; if (m === a || m === b) break; if (f(m) > 0) a = m; else b = m; }
        return (a + b) / 2;
      };
      if (trapped) { lo = root(0, -Math.PI / 3); hi = root(Math.PI, 5 * Math.PI / 3); }
      var build = function (dir, done) {
        var S = [0], Y = [0], D = [f(0)], s = 0, y = 0;
        while (!done(y, s)) {
          var k1 = f(y), h = dir * Math.min(0.05, 0.004 / Math.abs(k1));
          var k2 = f(y + h * k1 / 2), k3 = f(y + h * k2 / 2), k4 = f(y + h * k3);
          y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; s += h;
          if (trapped) y = Math.min(Math.max(y, lo), hi);
          S.push(s); Y.push(y); D.push(f(y));
        }
        return { S: S, Y: Y, D: D };
      };
      var hermite = function (T, k, t) {
        var H = T.S[k + 1] - T.S[k], t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * T.Y[k] + (t3 - 2 * t2 + t) * H * T.D[k] + (3 * t2 - 2 * t3) * T.Y[k + 1] + (t3 - t2) * H * T.D[k + 1];
      };
      // Index k with A[k] and A[k + 1] bracketing v, for monotone A.
      var locate = function (A, v) {
        var a = 0, b = A.length - 1, up = A[b] > A[0];
        while (b - a > 1) { var m = (a + b) >> 1; if ((A[m] <= v) === up) a = m; else b = m; }
        return a;
      };
      var evalT = function (T, s) {
        var k = locate(T.S, s);
        return hermite(T, k, (s - T.S[k]) / (T.S[k + 1] - T.S[k]));
      };
      var invT = function (T, y) {
        var k = locate(T.Y, y), a = 0, b = 1, up = T.Y[k + 1] > T.Y[k];
        for (var i = 0; i < 60; i++) { var m = (a + b) / 2; if ((hermite(T, k, m) < y) === up) a = m; else b = m; }
        return T.S[k] + (a + b) / 2 * (T.S[k + 1] - T.S[k]);
      };
      var theta, phi, period = null;
      if (!trapped) {
        var P = build(1, function (y) { return y >= TWO_PI; });
        period = invT(P, TWO_PI);
        theta = function (s) { var k = Math.floor(s / period); return TWO_PI * k + evalT(P, s - k * period); };
        phi = function (y) { var k = Math.floor(y / TWO_PI); return k * period + invT(P, y - TWO_PI * k); };
      } else {
        var near = function (z) { return function (y, s) { return Math.abs(z - y) < 1e-13 || Math.abs(s) > 4000; }; };
        var up = build(1, near(hi)), down = build(-1, near(lo));
        var end = function (T) { return T.Y[T.Y.length - 1]; };
        theta = function (s) {
          var T = s >= 0 ? up : down, last = T.S[T.S.length - 1];
          return Math.abs(s) >= Math.abs(last) ? end(T) : evalT(T, s);
        };
        phi = function (y) {
          if (y <= lo || y >= hi) return null;
          var T = y >= 0 ? up : down;
          return (y >= 0 ? y > end(T) : y < end(T)) ? null : invT(T, y);
        };
      }
      this.flowCache = { c: c, f: f, theta: theta, phi: phi, lo: lo, hi: hi, period: period };
      return this.flowCache;
    }
    recovery() {
      var st = this.state, c = st.c, noise = Math.pow(10, st.logNoise), d = this.driver(st.rSeed), F = this.flow(c);
      var X = d.X, Y = [], R = [], invalid = [], minF = Infinity, maxErr = 0;
      for (var i = 0; i < X.length; i++) {
        var y = F.theta(X[i]);
        Y.push(y);
        minF = Math.min(minF, F.f(y));
        var rec = F.phi(y + noise * d.E[i]);
        if (rec === null || !Number.isFinite(rec)) { rec = null; invalid.push(i); }
        else maxErr = Math.max(maxErr, Math.abs(rec - X[i]));
        R.push(rec);
      }
      return { X: X, Y: Y, R: R, invalid: invalid, minF: minF, maxErr: invalid.length < X.length ? maxErr : null };
    }
    renderVals() {
      var self = this, st = this.state, c = st.c, noise = Math.pow(10, st.logNoise), data = this.recovery();
      var X = data.X, Y = data.Y, R = data.R, N = X.length - 1;
      var sx = function (i) { return 48 + 652 * i / N; };
      var range = function (arr) { var lo = Infinity, hi = -Infinity; for (var k = 0; k < arr.length; k++) { lo = Math.min(lo, arr[k]); hi = Math.max(hi, arr[k]); } return [lo, hi]; };
      var xr = range(X.concat(R.filter(function (v) { return v !== null; }))), xpad = 0.15 * (xr[1] - xr[0]) + 0.1, xlo = xr[0] - xpad, xhi = xr[1] + xpad;
      var syX = function (v) { return 158 - (v - xlo) / (xhi - xlo) * 146; };
      var yr = range(Y), ypad = 0.12 * (yr[1] - yr[0]) + 0.15, ylo = yr[0] - ypad, yhi = yr[1] + ypad;
      var syY = function (v) { return 158 - (v - ylo) / (yhi - ylo) * 146; };
      var line = function (arr, f) {
        var s = '', connected = false;
        for (var k = 0; k <= N; k++) {
          if (arr[k] === null) { connected = false; continue; }
          s += (connected ? 'L' : 'M') + sx(k).toFixed(1) + ' ' + f(arr[k]).toFixed(1);
          connected = true;
        }
        return s;
      };
      var tick = function (y, label) { return { y: y.toFixed(1), ty: (y + 4).toFixed(1), label: label }; };
      var xStep = Math.pow(10, Math.floor(Math.log10((xhi - xlo) / 3))), xm = (xhi - xlo) / 3 / xStep, xTicks = [];
      xStep *= xm < 1.5 ? 1 : xm < 3.5 ? 2 : 5;
      for (var xv = Math.ceil(xlo / xStep) * xStep; xv <= xhi; xv += xStep) xTicks.push(tick(syX(xv), num(xv, xStep < 1 ? 1 : 0).replace(/\.0$/, '')));
      // Solution ticks at multiples of pi/2, thinned out when Y makes several turns.
      var half = Math.PI / 2, units = (yhi - ylo) / half, every = units <= 6 ? 1 : units <= 12 ? 2 : 4 * Math.ceil(units / 24), yTicks = [];
      var piLabel = function (n) {
        if (n === 0) return '0';
        var a = Math.abs(n), s = n < 0 ? '−' : '';
        return a % 2 === 0 ? s + (a === 2 ? '' : a / 2) + 'π' : s + (a === 1 ? '' : a) + 'π/2';
      };
      for (var n = Math.ceil(ylo / half / every) * every; n * half <= yhi; n += every) yTicks.push(tick(syY(n * half), piLabel(n)));
      var F = this.flow(c), zeros = [];
      if (c < CSTAR) {
        for (var m = -3; m <= 3; m++) {
          [F.lo + 2 * Math.PI * m, F.hi + 2 * Math.PI * m].forEach(function (z) {
            if (z > ylo && z < yhi) zeros.push({ y: syY(z).toFixed(1) });
          });
        }
      }
      var fx = function (v) { return 20 + (v + Math.PI) / (2 * Math.PI) * 200; };
      var fy = function (v) { return 108 - (v + 1.4) / 5.4 * 100; };
      var fPath = '';
      for (var q = 0; q <= 120; q++) { var yy = -Math.PI + 2 * Math.PI * q / 120; fPath += (q ? 'L' : 'M') + fx(yy).toFixed(1) + ' ' + fy(F.f(yy)).toFixed(1); }
      // Y is a continuous path, so its values modulo 2π form one arc of the circle.
      var band = function (a, b) { return { x: fx(a).toFixed(1), w: (fx(b) - fx(a)).toFixed(1) }; }, bands;
      if (yr[1] - yr[0] >= 2 * Math.PI) bands = [band(-Math.PI, Math.PI)];
      else {
        var a0 = yr[0] - 2 * Math.PI * Math.floor((yr[0] + Math.PI) / (2 * Math.PI)), a1 = a0 + yr[1] - yr[0];
        bands = a1 <= Math.PI ? [band(a0, a1)] : [band(a0, Math.PI), band(-Math.PI, a1 - 2 * Math.PI)];
      }
      return {
        drvPath: line(X, syX), recPath: line(R, syX), solPath: line(Y, syY),
        invalidMarks: data.invalid.map(function (i) { return { x: sx(i).toFixed(1) }; }),
        hasInvalid: data.invalid.length > 0, invalidLabel: data.invalid.length + ' / ' + X.length,
        xTicks: xTicks, yTicks: yTicks, zeroLines: zeros,
        fPath: fPath, fZero: fy(0).toFixed(1), fZeroL: (fy(0) + 4).toFixed(1), bands: bands,
        c: c, cLabel: c.toFixed(2), logNoise: st.logNoise, noiseLabel: sci(noise),
        minF: num(data.minF, 3), maxErr: data.maxErr === null ? '—' : data.maxErr.toFixed(3),
        setC: function (e) { self.setState({ c: parseFloat(e.target.value) }); },
        setNoise: function (e) { self.setState({ logNoise: parseFloat(e.target.value) }); },
        newDriver: function () { self.setState({ rSeed: st.rSeed + 1 }); }
      };
    }
  }

  SiteFigures.register('rough', { markup: markup, Component: Component });
})();
