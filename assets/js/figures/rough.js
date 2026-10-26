/* Interactive figure: rough driver recovery. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<p style="margin: 0; font-size: 14px; color: #515C55">\(\mathrm{d}Y_t = f(Y_t)\,\mathrm{d}\mathbf{X}_t, \quad f(y) = c + \cos y\)</p>
<p style="margin: 14px 0 0; font-size: 13px; color: #515C55"><span style="display: inline-block; width: 18px; height: 2px; background: #203D36; vertical-align: middle"></span> driver \(X\)   <span style="display: inline-block; width: 18px; height: 2px; background: #3E8E7E; vertical-align: middle"></span> recovered \(\hat X_t = \varphi(Y^{\mathrm{obs}}_t) - \varphi(y_0)\)</p>
<svg viewBox="0 0 720 170" role="img" aria-label="The Brownian driver and the driver recovered from noisy observations of the solution." style="display: block; width: 100%; height: auto; margin-top: 4px">
<defs><clipPath id="cpX"><rect x="48" y="12" width="652" height="146"></rect></clipPath></defs>
<line x1="48" x2="700" stroke="#EDF0E7" data-bind="y1:xZero; y2:xZero"></line>
<line x1="48" x2="48" y1="12" y2="158" stroke="#B8C1B6"></line>
<g clip-path="url(#cpX)" fill="none" stroke-linejoin="round">
<path stroke="#203D36" stroke-width="1.6" data-bind="d:drvPath"></path>
<path stroke="#3E8E7E" stroke-width="1.3" stroke-opacity="0.9" data-bind="d:recPath"></path>
<g data-for="invalidMarks" data-as="m" data-tpl="&lt;line x1=&quot;{{m.x}}&quot; x2=&quot;{{m.x}}&quot; y1=&quot;150&quot; y2=&quot;158&quot; stroke=&quot;#9D5C3E&quot; stroke-width=&quot;2&quot;&gt;&lt;/line&gt;"></g>
</g>
<text x="40" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end" data-bind="y:xZeroL">0</text>
</svg>
<p data-show="hasInvalid" role="status" style="margin: 4px 0 0; font-size: 13px; color: #9D5C3E"><span data-text="invalidLabel"></span> observations outside the inverse's domain. Gaps and rust marks indicate unavailable recovery; the error below uses valid samples only.</p>
<p style="margin: 8px 0 0; font-size: 13px; color: #515C55"><span style="display: inline-block; width: 18px; height: 2px; background: #203D36; vertical-align: middle"></span> solution \(Y\)   <span style="display: inline-block; width: 18px; border-top: 2px dashed #9D5C3E; vertical-align: middle"></span> zeros of \(f\)</p>
<svg viewBox="0 0 720 170" role="img" aria-label="The solution path, which cannot cross the zeros of the vector field." style="display: block; width: 100%; height: auto; margin-top: 4px">
<defs><clipPath id="cpY"><rect x="48" y="12" width="652" height="146"></rect></clipPath></defs>
<line x1="48" x2="48" y1="12" y2="158" stroke="#B8C1B6"></line>
<g data-for="zeroLines" data-as="z" data-tpl="&lt;line x1=&quot;48&quot; x2=&quot;700&quot; y1=&quot;{{z.y}}&quot; y2=&quot;{{z.y}}&quot; stroke=&quot;#9D5C3E&quot; stroke-width=&quot;1.2&quot; stroke-dasharray=&quot;4 4&quot;&gt;&lt;/line&gt;"></g>
<g clip-path="url(#cpY)" fill="none" stroke-linejoin="round">
<path stroke="#203D36" stroke-width="1.6" data-bind="d:solPath"></path>
</g>
<text x="40" y="20" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end"><tspan data-text="yTopLabel"></tspan></text>
<text x="40" y="158" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end"><tspan data-text="yBotLabel"></tspan></text>
</svg>
<div style="display: flex; flex-wrap: wrap; gap: 16px 32px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #EDF0E7; align-items: center">
<svg viewBox="0 0 220 120" role="img" aria-label="The vector field f on minus pi to pi, with the range visited by the solution shaded." style="flex: 0 0 200px; width: 200px; height: auto">
<rect y="8" height="100" fill="#EDF0E7" data-bind="x:bandX; width:bandW"></rect>
<line x1="10" x2="210" stroke="#B8C1B6" data-bind="y1:fZero; y2:fZero"></line>
<path fill="none" stroke="#244F46" stroke-width="1.8" data-bind="d:fPath"></path>
<text x="14" y="20" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="#244F46">f</text>
<text x="10" y="118" font-family="IBM Plex Mono, monospace" font-size="10" fill="#657061">−π</text>
<text x="210" y="118" font-family="IBM Plex Mono, monospace" font-size="10" fill="#657061" text-anchor="end">π</text>
</svg>
<div style="flex: 1 1 240px; min-width: 0; display: grid; gap: 10px">
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55">
<span>\(c =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="cLabel"></span></span></span>
<input type="range" min="0.2" max="2.5" step="0.01" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:c" data-on="input:setC">
</label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55">
<span>observation noise <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="noiseLabel"></span></span></span>
<input type="range" min="-4" max="-1.5" step="0.01" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:logNoise" data-on="input:setNoise">
</label>
</div>
<div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start; font-size: 13px; color: #515C55">
<span>\(\min_t f(Y_t) =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="minF"></span></span><br>max. \(|\hat X_t - X_t|\) (valid samples): <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="maxErr"></span></span></span>
<button type="button" style="font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid #B8C1B6; background: #FFFFFF; color: #203D36; font-size: 14px" data-on="click:newDriver">New driver</button>
</div>
</div>
<figcaption style="margin-top: 14px; font-size: 14px; color: #515C55">For a scalar geometric rough equation, the change of variables \(\varphi(y) = \int_0^y \frac{\mathrm{d}u}{f(u)}\) recovers \(X_t-X_0 = \varphi(Y_t)-\varphi(Y_0)\) on the interval containing \(Y_0\) where \(f\ne0\). Here \(X_t=2.2B_t\), \(X_0=Y_0=0\), and Gaussian observation noise is added to the solution. For \(c\le1\), the solution stays between the nearest zeros of \(f\); observations on or beyond those boundaries have no inverse on this interval. Within the interval, small observation errors are amplified locally by \(1/f(Y)\). Both plots scale to the displayed paths.</figcaption>
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
      var fx = function (v) { return 10 + (v + Math.PI) / (2 * Math.PI) * 200; };
      var fy = function (v) { return 108 - (v + 1) / 4.5 * 100; };
      var fPath = '';
      for (var q = 0; q <= 100; q++) { var yy = -Math.PI + 2 * Math.PI * q / 100; fPath += (q ? 'L' : 'M') + fx(yy).toFixed(1) + ' ' + fy(c + Math.cos(yy)).toFixed(1); }
      var b0 = fx(Math.max(-Math.PI, yr[0])), b1 = fx(Math.min(Math.PI, yr[1]));
      return {
        drvPath: line(X, syX), recPath: line(R, syX), solPath: line(Y, syY),
        invalidMarks: data.invalid.map(function (i) { return { x: sx(i).toFixed(1) }; }),
        hasInvalid: data.invalid.length > 0, invalidLabel: data.invalid.length + ' / ' + X.length,
        xZero: syX(0).toFixed(1), xZeroL: (syX(0) + 4).toFixed(1),
        zeroLines: zeros, yTopLabel: yhi.toFixed(1), yBotLabel: ylo.toFixed(1),
        fPath: fPath, fZero: fy(0).toFixed(1), bandX: b0.toFixed(1), bandW: Math.max(0, b1 - b0).toFixed(1),
        c: c, cLabel: c.toFixed(2), logNoise: st.logNoise, noiseLabel: noise.toExponential(1),
        minF: data.minF.toFixed(3), maxErr: data.maxErr === null ? '—' : data.maxErr.toFixed(3),
        setC: function (e) { self.setState({ c: parseFloat(e.target.value) }); },
        setNoise: function (e) { self.setState({ logNoise: parseFloat(e.target.value) }); },
        newDriver: function () { self.setState({ rSeed: st.rSeed + 1 }); }
      };
    }
  }

  SiteFigures.register('rough', { markup: markup, Component: Component });
})();
