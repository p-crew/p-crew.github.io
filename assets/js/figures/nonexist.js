/* Interactive figure: non-existence with GBM income. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<p style="margin: 0; font-size: 14px; color: #515C55">\(\mathrm{d}\eta_s = \mu\eta_s\,\mathrm{d}s + \sigma\eta_s\,\mathrm{d}B_s\), equal CRRA utilities with \(u_i'(x) = x^{-\gamma}\) (logarithmic utility when \(\gamma = 1\))</p>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 20px; margin-top: 16px">
<div>
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Parameter regime (click to move). Shaded: \(\sigma > 0,\ \chi < 0\)</p>
<svg viewBox="0 0 600 360" role="img" aria-label="Income volatility and drift. For positive volatility in the shaded region, the theorem excludes admissible feedback solutions for sufficiently large horizons. The zero-volatility axis is excluded." style="display: block; width: 100%; height: auto; cursor: crosshair" data-on="click:pick">
<defs><clipPath id="cpPlane"><rect x="56" y="24" width="520" height="296"></rect></clipPath></defs>
<path fill="#9D5C3E" fill-opacity="0.13" clip-path="url(#cpPlane)" data-bind="d:regionPath"></path>
<line x1="56" x2="576" y1="24" y2="24" stroke="#EDF0E7"></line>
<line x1="56" x2="576" y1="98" y2="98" stroke="#EDF0E7"></line>
<line x1="56" x2="576" y1="172" y2="172" stroke="#EDF0E7"></line>
<line x1="56" x2="576" y1="246" y2="246" stroke="#B8C1B6"></line>
<line x1="56" x2="576" y1="320" y2="320" stroke="#B8C1B6"></line>
<line x1="56" x2="56" y1="24" y2="320" stroke="#B8C1B6"></line>
<text x="48" y="28" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end">0.3</text>
<text x="48" y="102" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end">0.2</text>
<text x="48" y="176" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end">0.1</text>
<text x="48" y="250" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end">0</text>
<text x="48" y="324" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end">−0.1</text>
<text x="56" y="340" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">0</text>
<text x="229.3" y="340" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">0.2</text>
<text x="402.7" y="340" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">0.4</text>
<text x="576" y="340" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">0.6</text>
<text x="572" y="312" fill="#657061" font-family="Newsreader, serif" font-style="italic" font-size="17" text-anchor="end">σ</text>
<text x="68" y="44" fill="#657061" font-family="Newsreader, serif" font-style="italic" font-size="17">μ</text>
<path fill="none" stroke="#9D5C3E" stroke-width="2" clip-path="url(#cpPlane)" data-bind="d:curvePath"></path>
<circle r="7" stroke="#FFFFFF" stroke-width="2" data-bind="cx:ptX; cy:ptY; fill:ptFill"></circle>
</svg>
</div>
<div>
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Conservative bound \(X_t \le w_0 - (L-1)\int_0^t Y_s\,\mathrm{d}s\)</p>
<svg viewBox="0 0 600 360" role="img" aria-label="Numerical evaluations of the conservative wealth bound on 40 simulated income paths. Crossings illustrate the large-horizon argument; they do not certify a particular horizon." style="display: block; width: 100%; height: auto">
<defs><clipPath id="cpW"><rect x="56" y="24" width="520" height="296"></rect></clipPath></defs>
<rect x="56" width="520" fill="#9D5C3E" fill-opacity="0.07" data-bind="y:zeroY; height:negH"></rect>
<line x1="56" x2="576" y1="24" y2="24" stroke="#EDF0E7"></line>
<line x1="56" x2="576" stroke="#EDF0E7" data-bind="y1:w1Y; y2:w1Y"></line>
<line x1="56" x2="576" y1="320" y2="320" stroke="#B8C1B6"></line>
<line x1="56" x2="56" y1="24" y2="320" stroke="#B8C1B6"></line>
<line x1="56" x2="576" stroke="#9D5C3E" stroke-dasharray="4 5" stroke-width="1.4" data-bind="y1:zeroY; y2:zeroY"></line>
<text x="48" fill="#9D5C3E" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end" data-bind="y:zeroYL">0</text>
<text x="48" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="end" data-bind="y:w1YL">1</text>
<text x="56" y="340" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">0</text>
<text x="576" y="340" fill="#657061" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">ℓ = 1</text>
<g clip-path="url(#cpW)" fill="none">
<g data-for="paths" data-as="p" data-tpl="&lt;path d=&quot;{{p.d}}&quot; stroke=&quot;{{p.color}}&quot; stroke-width=&quot;1.3&quot; stroke-opacity=&quot;0.85&quot;&gt;&lt;/path&gt;"></g>
</g>
<text x="316" y="155" fill="#657061" font-family="IBM Plex Sans, sans-serif" font-size="14" text-anchor="middle" data-show="noBound">Bound unavailable for these settings.</text>
<text x="316" y="177" fill="#657061" font-family="IBM Plex Sans, sans-serif" font-size="13" text-anchor="middle" data-show="noBound">Requires σ &gt; 0, χ &lt; 0 and T &gt; ℓ + ε.</text>
</svg>
</div>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 10px 24px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #EDF0E7">
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55"><span>horizon \(T =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="TLabel"></span></span></span><input type="range" min="1" max="80" step="0.5" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:T" data-on="input:setT"></label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55"><span>drift \(\mu =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="muLabel"></span></span></span><input type="range" min="-0.1" max="0.3" step="0.005" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:mu" data-on="input:setMu"></label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55"><span>volatility \(\sigma =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="sigLabel"></span></span></span><input type="range" min="0" max="0.6" step="0.01" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:sig" data-on="input:setSig"></label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55"><span>risk aversion \(\gamma =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="gLabel"></span></span></span><input type="range" min="0.3" max="4" step="0.05" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:g" data-on="input:setG"></label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55"><span>interest \(r =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="rLabel"></span></span></span><input type="range" min="-0.02" max="0.1" step="0.005" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:r" data-on="input:setR"></label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #515C55"><span>discount \(\delta =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="dLabel"></span></span></span><input type="range" min="0" max="0.15" step="0.005" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:d" data-on="input:setD"></label>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 10px 36px; margin-top: 14px; font-size: 13px; color: #515C55">
<span>\(\chi = r - \delta - \gamma\mu + \tfrac12\gamma(\gamma+1)\sigma^2\)<br><span style="font-family: 'IBM Plex Mono', monospace; font-size: 17px"><span data-text="chiLabel"></span></span></span>
<span>\(L(T) = K_\varepsilon e^{-\chi(T-\varepsilon-\ell)/\gamma}\)<br><span style="font-family: 'IBM Plex Mono', monospace; font-size: 17px; color: #203D36"><span data-text="LLabel"></span></span><br>\(\varepsilon =\) <span data-text="epsLabel"></span>, \(K_\varepsilon =\) <span data-text="KLabel"></span></span>
<span>simulated bound below 0 at \(\ell\)<br><span style="font-family: 'IBM Plex Mono', monospace; font-size: 17px; color: #9D5C3E"><span data-text="negLabel"></span></span></span>
<span style="flex: 1 1 240px; align-self: center; font-size: 14px">
<span data-show="vLong" style="color: #9D5C3E">\(\sigma > 0,\ \chi < 0\): no solution in the stated class for all sufficiently large horizons. This simulation does not determine the threshold \(T^*\).</span>
<span data-show="vZero" style="color: #515C55">\(\sigma = 0\): income is deterministic. This non-existence theorem requires \(\sigma > 0\).</span>
<span data-show="vNa" style="color: #244F46">\(\chi \ge 0\): this non-existence argument does not apply.</span>
</span>
</div>
<figcaption style="margin-top: 14px; font-size: 14px; color: #515C55">Consider feedback solutions with positive terminal wealth, finite cumulative consumption and a positive uniformly integrable discounted adjoint. For \(\sigma > 0\), terminal solvency forces wealth to stay non-negative. If also \(\chi < 0\), the consumption bound \(c_t/\eta_t \ge L(T)\) on \([0,\ell]\) eventually contradicts this requirement on a set of positive probability. The plot uses conservative, parameter-dependent \(\varepsilon\) and \(K_\varepsilon\) from the terminal-interval estimates, with \(\lambda = w_0 = \eta_0 = \ell = 1\). Integrals of discounted income \(Y = \Gamma^{-1}\eta\) use trapezoidal quadrature on 40 simulated paths. Crossings illustrate the argument; the simulation is not a finite-horizon non-existence test.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { T: 1, mu: 0.05, sig: 0.1, g: 2, r: 0.02, d: 0.05 };
    }
    componentDidMount() {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { this.setState({ T: 30 }); return; }
      var self = this, t0 = performance.now(), dur = 4500;
      var tick = function (now) {
        if (self.touched) return;
        var p = Math.min(1, (now - t0) / dur), e = p * p * (3 - 2 * p);
        self.setState({ T: 1 + 39 * e });
        if (p < 1) self.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
    componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
    estimate() {
      var st = this.state, g = st.g, rb = Math.abs(st.r);
      var chi = st.r - st.d - g * st.mu + 0.5 * g * (g + 1) * st.sig * st.sig;
      // GBM non-existence sketch, Lemmas 3–4 and equation (5), with lambda = 1.
      // Choose eps <= 0.2 so A eps (1 + exp((|mu| + rbar) eps)) <= 1/2.
      var A = Math.exp((st.d + Math.abs(1 - g) * rb) / g);
      var eps = Math.min(0.2, 0.5 / (A * (1 + Math.exp((Math.abs(st.mu) + rb) * 0.2))));
      var q = -g * (st.mu - st.r) + 0.5 * g * (g + 1) * st.sig * st.sig;
      var z = q * eps, moment = z === 0 ? 1 : Math.expm1(z) / z;
      // C_eps = 2^g eps^(-g) exprel(q eps); work in logarithms.
      var logK = Math.log(eps / 2) - Math.log(moment) / g + eps * (st.d - Math.abs(1 - g) * rb) / g;
      var available = st.sig > 0 && chi < 0 && st.T > 1 + eps;
      return { chi: chi, eps: eps, K: Math.exp(logK), available: available,
        L: available ? Math.exp(logK - chi * (st.T - eps - 1) / g) : null };
    }
    noise() {
      if (this.dB) return this.dB;
      var a = 20261026 >>> 0;
      var r = function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      var out = [];
      for (var i = 0; i < 40; i++) {
        var row = [];
        for (var j = 0; j < 100; j++) {
          var u = Math.max(r(), 1e-12), v = r();
          row.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.1);
        }
        out.push(row);
      }
      this.dB = out;
      return out;
    }
    renderVals() {
      var self = this, st = this.state, g = st.g, mu = st.mu, sig = st.sig, r = st.r, d = st.d, T = st.T;
      var estimate = this.estimate(), chi = estimate.chi, L = estimate.L;
      var px = function (s) { return 56 + 520 * s / 0.6; };
      var py = function (m) { return 320 - 296 * (m + 0.1) / 0.4; };
      var muStar = function (s) { return (r - d + 0.5 * g * (g + 1) * s * s) / g; };
      var curve = '';
      for (var i = 0; i <= 120; i++) {
        var s = 0.6 * i / 120;
        curve += (i ? 'L' : 'M') + px(s).toFixed(1) + ' ' + py(Math.max(-0.14, Math.min(0.34, muStar(s)))).toFixed(1);
      }
      var region = curve + 'L576 ' + py(0.34).toFixed(1) + 'L56 ' + py(0.34).toFixed(1) + 'Z';
      var dB = this.noise(), N = 100, paths = [], neg = 0;
      var sx = function (k) { return 56 + 520 * k / N; };
      var sy = function (v) { return 320 - 296 * (v + 3) / 5; };
      for (var p = 0; estimate.available && p < dB.length; p++) {
        var B = 0, Yprev = 1, I = 0, path = 'M56 ' + sy(1).toFixed(1);
        for (var k = 1; k <= N; k++) {
          B += dB[p][k - 1];
          var Y = Math.exp((mu - r - 0.5 * sig * sig) * k / N + sig * B);
          I += 0.5 * (Y + Yprev) / N;
          Yprev = Y;
          path += 'L' + sx(k).toFixed(1) + ' ' + Math.max(-40, Math.min(400, sy(1 + (1 - L) * I))).toFixed(1);
        }
        var below = 1 + (1 - L) * I < 0;
        if (below) neg++;
        paths.push({ d: path, color: below ? '#9D5C3E' : '#244F46' });
      }
      var stop = function () { self.touched = true; if (self.raf) cancelAnimationFrame(self.raf); };
      var set = function (key) { return function (e) { stop(); var o = {}; o[key] = parseFloat(e.target.value); self.setState(o); }; };
      return {
        regionPath: region, curvePath: curve,
        ptX: px(sig).toFixed(1), ptY: py(mu).toFixed(1), ptFill: sig === 0 ? '#657061' : (chi < 0 ? '#9D5C3E' : '#244F46'),
        paths: paths, noBound: !estimate.available,
        zeroY: sy(0).toFixed(1), zeroYL: (sy(0) + 4).toFixed(1), negH: (320 - sy(0)).toFixed(1),
        w1Y: sy(1).toFixed(1), w1YL: (sy(1) + 4).toFixed(1),
        T: T, mu: mu, sig: sig, g: g, r: r, d: d,
        TLabel: T.toFixed(1), muLabel: mu.toFixed(3), sigLabel: sig.toFixed(2), gLabel: g.toFixed(2), rLabel: r.toFixed(3), dLabel: d.toFixed(3),
        chiLabel: chi.toFixed(4), chiColor: chi < 0 ? '#9D5C3E' : '#244F46',
        LLabel: !estimate.available ? '—' : (L < 1000 ? L.toFixed(3) : L.toExponential(1)),
        epsLabel: estimate.eps.toFixed(3), KLabel: estimate.K.toPrecision(3),
        negLabel: estimate.available ? neg + ' / ' + dB.length : '—',
        vLong: sig > 0 && chi < 0, vZero: sig === 0, vNa: sig > 0 && chi >= 0,
        setT: set('T'), setMu: set('mu'), setSig: set('sig'), setG: set('g'), setR: set('r'), setD: set('d'),
        pick: function (e) {
          stop();
          var rect = e.currentTarget.getBoundingClientRect();
          var vx = (e.clientX - rect.left) / rect.width * 600, vy = (e.clientY - rect.top) / rect.height * 360;
          var s = Math.max(0, Math.min(0.6, (vx - 56) / 520 * 0.6));
          var m = Math.max(-0.1, Math.min(0.3, (320 - vy) / 296 * 0.4 - 0.1));
          self.setState({ sig: Math.round(s * 100) / 100, mu: Math.round(m * 200) / 200 });
        }
      };
    }
  }

  SiteFigures.register('nonexist', { markup: markup, Component: Component });
})();
