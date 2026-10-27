/* Interactive figure: non-existence with GBM income. Loaded on demand by script.js. */
(function () {
  'use strict';

  // Typographic minus sign for negative numbers.
  function num(v, digits) { return v.toFixed(digits).replace(/^-(?=.*[1-9])/, '−').replace(/^-/, ''); }

  var INTRO_HORIZON = 65;

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">Non-existence for long horizons</p>
<p class="fig-lead">Income follows a geometric Brownian motion, \(\mathrm{d}\eta_s = \mu\eta_s\,\mathrm{d}s + \sigma\eta_s\,\mathrm{d}B_s\), and utility is CRRA, \(u'(x) = x^{-\gamma}\). If \(\sigma > 0\) and \(\chi &lt; 0\), there is no admissible solution once the horizon \(T\) is long enough: consumption must exceed income by a factor that grows with \(T\), which eventually drives wealth below zero on some income paths.</p>
</div>
<div class="fig-plots">
<div>
<p class="fig-label">Shaded where \(\chi &lt; 0\); click and drag to move \((\sigma, \mu)\)</p>
<svg viewBox="0 0 600 360" role="group" tabindex="0" aria-label="Volatility and drift plot. Click and drag to select values, or use arrow keys to adjust them. The shaded region indicates chi below zero; the zero-volatility axis is excluded." style="cursor: crosshair; touch-action: none; user-select: none" data-on="pointerdown:pickStart; pointermove:pickMove; pointerup:pickEnd; pointercancel:pickEnd; lostpointercapture:pickEnd; keydown:pickKey">
<defs><clipPath id="cpPlane"><rect x="56" y="24" width="520" height="296"></rect></clipPath></defs>
<path fill="#9D5C3E" fill-opacity="0.13" clip-path="url(#cpPlane)" data-bind="d:regionPath"></path>
<path d="M56 24V320H576" fill="none" stroke="#B8C1B6" stroke-width="1.4"></path>
<g font-family="IBM Plex Mono, monospace" font-size="18" fill="#657061" text-anchor="end">
<text x="48" y="29">0.3</text><text x="48" y="103">0.2</text><text x="48" y="177">0.1</text><text x="48" y="251">0</text><text x="48" y="325">−0.1</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="18" fill="#657061" text-anchor="middle">
<text x="56" y="346">0</text><text x="229.3" y="346">0.2</text><text x="402.7" y="346">0.4</text><text x="576" y="346">0.6</text>
</g>
<text x="566" y="308" fill="#657061" font-family="Newsreader, serif" font-style="italic" font-size="25" text-anchor="end">σ</text>
<text x="68" y="46" fill="#657061" font-family="Newsreader, serif" font-style="italic" font-size="25">μ</text>
<path fill="none" stroke="#9D5C3E" stroke-width="2.4" clip-path="url(#cpPlane)" data-bind="d:curvePath"></path>
<circle r="8" stroke="#FFFFFF" stroke-width="2.5" data-bind="cx:ptX; cy:ptY; fill:ptFill"></circle>
</svg>
</div>
<div>
<p class="fig-label">Wealth bound \(w_0 - (L-1)\int_0^t Y_s\,\mathrm{d}s\) on 40 income paths</p>
<svg viewBox="0 0 600 360" role="img" aria-label="Numerical evaluations of the conservative wealth bound on 40 simulated income paths. Crossings illustrate the large-horizon argument; they do not certify a particular horizon.">
<defs><clipPath id="cpW"><rect x="56" y="24" width="520" height="296"></rect></clipPath></defs>
<rect x="56" width="520" fill="#9D5C3E" fill-opacity="0.07" data-bind="y:zeroY; height:negH"></rect>
<path d="M56 24V320H576" fill="none" stroke="#B8C1B6" stroke-width="1.4"></path>
<line x1="56" x2="576" stroke="#9D5C3E" stroke-width="1.2" stroke-dasharray="5 5" data-bind="y1:zeroY; y2:zeroY"></line>
<g font-family="IBM Plex Mono, monospace" font-size="18" text-anchor="end">
<text x="48" fill="#9D5C3E" data-bind="y:zeroYL">0</text>
<text x="48" fill="#657061" data-bind="y:w1YL">1</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="18" fill="#657061" text-anchor="middle">
<text x="56" y="346">0</text><text x="576" y="346">ℓ</text>
</g>
<text x="316" y="346" fill="#657061" font-family="Newsreader, serif" font-style="italic" font-size="25" text-anchor="middle">t</text>
<g clip-path="url(#cpW)" fill="none">
<g data-for="paths" data-as="p" data-tpl="&lt;path d=&quot;{{p.d}}&quot; stroke=&quot;{{p.color}}&quot; stroke-width=&quot;1.6&quot; stroke-opacity=&quot;0.8&quot;&gt;&lt;/path&gt;"></g>
</g>
<g font-family="IBM Plex Sans, sans-serif" fill="#657061" text-anchor="middle" data-show="noBound">
<text x="316" y="160" font-size="22">No bound for these settings</text>
<text x="316" y="188" font-size="19">(needs σ &gt; 0, χ &lt; 0 and T &gt; ℓ + ε)</text>
</g>
</svg>
</div>
</div>
<div class="fig-controls">
<label class="fig-slider"><span>Horizon \(T\) <span class="v" data-text="TLabel"></span></span><input type="range" min="1" max="80" step="0.5" aria-label="horizon T" data-bind="value:T" data-on="input:setT"></label>
<label class="fig-slider"><span>Drift \(\mu\) <span class="v" data-text="muLabel"></span></span><input type="range" min="-0.1" max="0.3" step="0.005" aria-label="drift mu" data-bind="value:mu" data-on="input:setMu"></label>
<label class="fig-slider"><span>Volatility \(\sigma\) <span class="v" data-text="sigLabel"></span></span><input type="range" min="0" max="0.6" step="0.01" aria-label="volatility sigma" data-bind="value:sig" data-on="input:setSig"></label>
<label class="fig-slider"><span>Risk aversion \(\gamma\) <span class="v" data-text="gLabel"></span></span><input type="range" min="0.3" max="4" step="0.05" aria-label="risk aversion gamma" data-bind="value:g" data-on="input:setG"></label>
<label class="fig-slider"><span>Interest \(r\) <span class="v" data-text="rLabel"></span></span><input type="range" min="-0.02" max="0.1" step="0.005" aria-label="interest rate r" data-bind="value:r" data-on="input:setR"></label>
<label class="fig-slider"><span>Discount \(\delta\) <span class="v" data-text="dLabel"></span></span><input type="range" min="0" max="0.15" step="0.005" aria-label="discount rate delta" data-bind="value:d" data-on="input:setD"></label>
</div>
<dl class="fig-readout">
<div><dt>\(\chi\)</dt><dd data-text="chiLabel"></dd></div>
<div><dt>Consumption floor \(L\)</dt><dd data-text="LLabel"></dd></div>
<div><dt>\(\varepsilon\), \(K_\varepsilon\)</dt><dd><span data-text="epsLabel"></span>, <span data-text="KLabel"></span></dd></div>
<div><dt>Paths below zero at \(t = \ell\)</dt><dd class="c-rust" data-text="negLabel"></dd></div>
</dl>
<p class="fig-status warn" data-show="vLong" role="status">\(\sigma > 0\), \(\chi &lt; 0\): no admissible solution once \(T\) is large enough.</p>
<p class="fig-status quiet" data-show="vZero" role="status">\(\sigma = 0\): income is deterministic, which the theorem excludes.</p>
<p class="fig-status" data-show="vNa" role="status">\(\chi \ge 0\): the non-existence argument does not apply.</p>
<figcaption class="fig-caption">Here \(\chi = r - \delta - \gamma\mu + \tfrac12\gamma(\gamma+1)\sigma^2\). On an initial interval \([0, \ell]\), consumption is at least \(L\) times income, where \(L = K_\varepsilon \exp(-\chi(T-\varepsilon-\ell)/\gamma)\) and \(\varepsilon\), \(K_\varepsilon\) come from the terminal-interval estimates. Wealth at time \(t\) is then at most \(w_0 - (L-1)\int_0^t Y_s\,\mathrm{d}s\), where \(Y_s = e^{-rs}\eta_s\) is discounted income. We take \(w_0 = \eta_0 = \ell = 1\) and terminal weight \(\lambda = 1\). The simulation illustrates the argument; it does not locate the critical horizon.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { T: 1, mu: 0.05, sig: 0.1, g: 2, r: 0.02, d: 0.05 };
      this.activePointer = null;
      this.introRunning = false;
      this.raf = null;
    }
    componentDidMount() {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { this.setState({ T: INTRO_HORIZON }); return; }
      this.introRunning = true;
      var self = this, t0 = performance.now(), dur = 6000;
      var tick = function (now) {
        if (!self.introRunning) return;
        var p = Math.min(1, (now - t0) / dur), e = p * p * (3 - 2 * p);
        self.setState({ T: Math.round(2 * (1 + (INTRO_HORIZON - 1) * e)) / 2 });
        if (p < 1) self.raf = requestAnimationFrame(tick);
        else { self.introRunning = false; self.raf = null; }
      };
      this.raf = requestAnimationFrame(tick);
    }
    componentWillUnmount() { this.activePointer = null; this.stopIntro(true); }
    stopIntro(preserveHorizon) {
      var finish = this.introRunning && !preserveHorizon;
      this.introRunning = false;
      this.touched = true;
      if (this.raf !== null) { cancelAnimationFrame(this.raf); this.raf = null; }
      // Parameter exploration skips to the intro's endpoint, rather than
      // trapping the bound at a short horizon with no crossings. An explicit
      // horizon choice (or unmount) must keep the current value instead.
      if (finish) this.setState({ T: INTRO_HORIZON });
    }
    pickAt(e) {
      var rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var vx = (e.clientX - rect.left) / rect.width * 600;
      var vy = (e.clientY - rect.top) / rect.height * 360;
      var s = Math.max(0, Math.min(0.6, (vx - 56) / 520 * 0.6));
      var m = Math.max(-0.1, Math.min(0.3, (320 - vy) / 296 * 0.4 - 0.1));
      var sig = Math.round(s * 100) / 100, mu = Math.round(m * 200) / 200;
      if (sig !== this.state.sig || mu !== this.state.mu) this.setState({ sig: sig, mu: mu });
    }
    pickStart(e) {
      if (this.activePointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      this.activePointer = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);
      this.stopIntro();
      this.pickAt(e);
      e.preventDefault();
    }
    pickMove(e) {
      if (e.pointerId !== this.activePointer) return;
      this.pickAt(e);
      e.preventDefault();
    }
    pickEnd(e) {
      if (e.pointerId !== this.activePointer) return;
      if (e.type === 'pointerup') this.pickAt(e);
      this.activePointer = null;
      var svg = e.currentTarget;
      if (svg.hasPointerCapture && svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId);
    }
    pickKey(e) {
      var ds = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      var dm = e.key === 'ArrowDown' ? -1 : e.key === 'ArrowUp' ? 1 : 0;
      if (!ds && !dm) return;
      e.preventDefault();
      this.stopIntro();
      var step = e.shiftKey ? 5 : 1;
      var sig = Math.max(0, Math.min(60, Math.round(this.state.sig * 100) + ds * step)) / 100;
      var mu = Math.max(-20, Math.min(60, Math.round(this.state.mu * 200) + dm * step)) / 200;
      if (sig !== this.state.sig || mu !== this.state.mu) this.setState({ sig: sig, mu: mu });
    }
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
      var set = function (key) { return function (e) { self.stopIntro(key === 'T'); var o = {}; o[key] = parseFloat(e.target.value); self.setState(o); }; };
      return {
        regionPath: region, curvePath: curve,
        ptX: px(sig).toFixed(1), ptY: py(mu).toFixed(1), ptFill: sig === 0 ? '#657061' : (chi < 0 ? '#9D5C3E' : '#244F46'),
        paths: paths, noBound: !estimate.available,
        zeroY: sy(0).toFixed(1), zeroYL: (sy(0) + 4).toFixed(1), negH: (320 - sy(0)).toFixed(1),
        w1Y: sy(1).toFixed(1), w1YL: (sy(1) + 4).toFixed(1),
        T: T, mu: mu, sig: sig, g: g, r: r, d: d,
        TLabel: T.toFixed(1), muLabel: num(mu, 3), sigLabel: sig.toFixed(2), gLabel: g.toFixed(2), rLabel: num(r, 3), dLabel: d.toFixed(3),
        chiLabel: num(chi, 4), chiColor: chi < 0 ? '#9D5C3E' : '#244F46',
        LLabel: !estimate.available ? '—' : (L < 1000 ? L.toFixed(3) : L.toExponential(1)),
        epsLabel: estimate.eps.toFixed(3), KLabel: estimate.K.toPrecision(3),
        negLabel: estimate.available ? neg + ' / ' + dB.length : '—',
        vLong: sig > 0 && chi < 0, vZero: sig === 0, vNa: sig > 0 && chi >= 0,
        setT: set('T'), setMu: set('mu'), setSig: set('sig'), setG: set('g'), setR: set('r'), setD: set('d'),
        pickStart: function (e) { self.pickStart(e); },
        pickMove: function (e) { self.pickMove(e); },
        pickEnd: function (e) { self.pickEnd(e); },
        pickKey: function (e) { self.pickKey(e); }
      };
    }
  }

  SiteFigures.register('nonexist', { markup: markup, Component: Component });
})();
