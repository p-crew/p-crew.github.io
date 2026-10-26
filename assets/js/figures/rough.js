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

  var markup = String.raw`
<figure class="fig">
<div class="fig-model">\(\mathrm{d}Y_t = f(Y_t)\,\mathrm{d}\mathbf{X}_t\), \(f(y) = c + \cos y\)</div>
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
<p class="fig-label">\(f\) on \([-\pi, \pi]\); shaded: range of \(Y\)</p>
<svg viewBox="0 0 240 132" role="img" aria-label="The vector field f on minus pi to pi, with the range visited by the solution shaded." style="max-width: 240px">
<rect y="8" height="100" fill="#EDF0E7" data-bind="x:bandX; width:bandW"></rect>
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
<p class="fig-status warn" data-show="hasInvalid" role="status">Some noisy observations lie on or beyond a zero of \(f\), where \(\varphi\) is undefined. They are left as gaps (rust ticks) and excluded from the error.</p>
<figcaption class="fig-caption">On the interval around \(y_0\) where \(f \ne 0\), \(\varphi(y) = \int_0^y \mathrm{d}u/f(u)\) inverts the solution map, so \(X_t - X_0 = \varphi(Y_t) - \varphi(Y_0)\). Here \(X = 2.2B\) for a Brownian motion \(B\), and observation noise is amplified by \(1/f(Y)\) near the zeros of \(f\).</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { rSeed: 11, c: 1.4, logNoise: -2.5 };
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
      for (var i = 1; i <= N; i++) X.push(X[i - 1] + 2.2 * Math.sqrt(1 / N) * this.gauss(r));
      for (var j = 0; j <= N; j++) E.push(this.gauss(r));
      this.drvCache = { seed: seed, X: X, E: E };
      return this.drvCache;
    }
    flow(c) {
      // Exact scalar flow Theta' = c + cos(Theta), Theta(0) = 0.
      // The half-angle substitution gives hyperbolic, rational and periodic
      // forms for c < 1, c = 1 and c > 1 respectively. No finite lookup domain.
      if (this.flowCache && this.flowCache.c === c) return this.flowCache;
      var theta, phi, boundary = c <= 1 ? Math.acos(-c) : Infinity;
      if (c < 1) {
        var k = Math.sqrt((1 - c) * (1 + c)), scale = Math.sqrt((1 + c) / (1 - c));
        theta = function (s) { return 2 * Math.atan(scale * Math.tanh(k * s / 2)); };
        phi = function (y) {
          if (Math.abs(y) >= boundary) return null;
          // This logarithmic form remains accurate close to either boundary.
          return (Math.log(Math.sin((boundary + y) / 2)) - Math.log(Math.sin((boundary - y) / 2))) / k;
        };
      } else if (c === 1) {
        theta = function (s) { return 2 * Math.atan(s); };
        phi = function (y) { return Math.abs(y) < Math.PI ? Math.tan(y / 2) : null; };
      } else {
        var omega = Math.sqrt((c - 1) * (c + 1)), scaleUp = Math.sqrt((c + 1) / (c - 1));
        theta = function (s) {
          var angle = omega * s / 2, turns = Math.floor((angle + Math.PI / 2) / Math.PI), u = angle - turns * Math.PI;
          return 2 * Math.atan2(scaleUp * Math.sin(u), Math.cos(u)) + 2 * Math.PI * turns;
        };
        phi = function (y) {
          var turns = Math.floor((y + Math.PI) / (2 * Math.PI)), u = y - 2 * Math.PI * turns;
          return (2 * Math.atan2(Math.sin(u / 2) / scaleUp, Math.cos(u / 2)) + 2 * Math.PI * turns) / omega;
        };
      }
      this.flowCache = { c: c, theta: theta, phi: phi, boundary: boundary };
      return this.flowCache;
    }
    recovery() {
      var st = this.state, c = st.c, noise = Math.pow(10, st.logNoise), d = this.driver(st.rSeed), F = this.flow(c);
      var X = d.X, Y = [], R = [], invalid = [], minF = Infinity, maxErr = 0;
      for (var i = 0; i < X.length; i++) {
        var y = F.theta(X[i]);
        Y.push(y);
        minF = Math.min(minF, c + Math.cos(y));
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
      var zeros = [];
      if (c <= 1) {
        var a0 = Math.acos(-c);
        var seen = {};
        for (var m = -3; m <= 3; m++) {
          [a0 + 2 * Math.PI * m, -a0 + 2 * Math.PI * m].forEach(function (z) {
            if (z > ylo && z < yhi && !seen[z]) { zeros.push({ y: syY(z).toFixed(1) }); seen[z] = true; }
          });
        }
      }
      var fx = function (v) { return 20 + (v + Math.PI) / (2 * Math.PI) * 200; };
      var fy = function (v) { return 108 - (v + 1) / 4.5 * 100; };
      var fPath = '';
      for (var q = 0; q <= 100; q++) { var yy = -Math.PI + 2 * Math.PI * q / 100; fPath += (q ? 'L' : 'M') + fx(yy).toFixed(1) + ' ' + fy(c + Math.cos(yy)).toFixed(1); }
      var b0 = fx(Math.max(-Math.PI, yr[0])), b1 = fx(Math.min(Math.PI, yr[1]));
      return {
        drvPath: line(X, syX), recPath: line(R, syX), solPath: line(Y, syY),
        invalidMarks: data.invalid.map(function (i) { return { x: sx(i).toFixed(1) }; }),
        hasInvalid: data.invalid.length > 0, invalidLabel: data.invalid.length + ' / ' + X.length,
        xTicks: xTicks, yTicks: yTicks, zeroLines: zeros,
        fPath: fPath, fZero: fy(0).toFixed(1), fZeroL: (fy(0) + 4).toFixed(1), bandX: b0.toFixed(1), bandW: Math.max(0, b1 - b0).toFixed(1),
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
