/* Interactive figure: regularised couplings. Loaded on demand by script.js. */
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

  var markup = String.raw`
<figure class="fig">
<ul class="fig-legend">
<li><span class="sw c-teal"></span>regularised, \(\varepsilon > 0\)</li>
<li><span class="sw dash c-grey"></span>singular, \(\varepsilon = 0\)</li>
</ul>
<div class="fig-plots">
<div>
<p class="fig-label">Consumption feedback \(\psi_\varepsilon(m) = (\varepsilon + m^+)^{-1/\gamma_1}\)</p>
<svg viewBox="0 0 360 272" role="img" aria-label="The consumption feedback map on a log scale: the singular map blows up as m tends to zero, the regularised map stays bounded.">
<defs><clipPath id="cpPsi"><rect x="44" y="16" width="300" height="228"></rect></clipPath></defs>
<path d="M44 16V244H344" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="end">
<text x="38" y="248">10⁻¹</text><text x="38" y="172">10⁰</text><text x="38" y="96">10¹</text><text x="38" y="20">10²</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="middle">
<text x="44" y="262">0</text><text x="194" y="262">1</text><text x="344" y="262">2</text>
</g>
<text x="336" y="234" font-family="Newsreader, serif" font-style="italic" font-size="16" fill="#657061" text-anchor="end">m</text>
<g clip-path="url(#cpPsi)" fill="none" stroke-linecap="round">
<path stroke="#A3ACA0" stroke-width="1.5" stroke-dasharray="4 4" data-bind="d:psiSing"></path>
<path stroke="#244F46" stroke-width="2" data-bind="d:psiReg"></path>
</g>
</svg>
</div>
<div>
<p class="fig-label">Terminal coupling \(g_\varepsilon(w) = \lambda(\varepsilon + w^+)^{-\gamma_2}\)</p>
<svg viewBox="0 0 360 272" role="img" aria-label="The terminal marginal utility on a log scale: the singular map blows up as terminal wealth tends to zero, the regularised map stays bounded.">
<defs><clipPath id="cpG"><rect x="44" y="16" width="300" height="228"></rect></clipPath></defs>
<path d="M44 16V244H344" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="end">
<text x="38" y="248">10⁻¹</text><text x="38" y="172">10⁰</text><text x="38" y="96">10¹</text><text x="38" y="20">10²</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="12" fill="#657061" text-anchor="middle">
<text x="44" y="262">0</text><text x="194" y="262">1</text><text x="344" y="262">2</text>
</g>
<text x="336" y="234" font-family="Newsreader, serif" font-style="italic" font-size="16" fill="#657061" text-anchor="end">w</text>
<g clip-path="url(#cpG)" fill="none" stroke-linecap="round">
<path stroke="#A3ACA0" stroke-width="1.5" stroke-dasharray="4 4" data-bind="d:gSing"></path>
<path stroke="#244F46" stroke-width="2" data-bind="d:gReg"></path>
</g>
</svg>
</div>
</div>
<div class="fig-controls">
<label class="fig-slider"><span>\(\varepsilon\) <span class="v" data-text="epsLabel"></span></span>
<input type="range" min="-3" max="0" step="0.01" aria-label="epsilon, log scale" data-bind="value:logEps" data-on="input:setEps"></label>
<label class="fig-slider"><span>\(\gamma_1\) <span class="v" data-text="g1Label"></span></span>
<input type="range" min="0.3" max="3" step="0.05" aria-label="gamma 1" data-bind="value:g1" data-on="input:setG1"></label>
<label class="fig-slider"><span>\(\gamma_2\) <span class="v" data-text="g2Label"></span></span>
<input type="range" min="0.3" max="3" step="0.05" aria-label="gamma 2" data-bind="value:g2" data-on="input:setG2"></label>
</div>
<p class="fig-status" data-show="ok">\(\gamma_2 \le \gamma_1\): covered by the short-time well-posedness result.</p>
<p class="fig-status warn" data-show="notOk">\(\gamma_2 > \gamma_1\): outside the short-time well-posedness result.</p>
<figcaption class="fig-caption">For each \(\varepsilon > 0\) the regularised couplings, with \(x^+ = \max(x, 0)\), are monotone and globally Lipschitz. Log scale; \(\lambda = 1\).</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { logEps: 0, g1: 1.5, g2: 1 };
    }
    componentDidMount() {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { this.setState({ logEps: -2 }); return; }
      var self = this, t0 = performance.now(), dur = 3000;
      var tick = function (now) {
        if (self.touched) return;
        var p = Math.min(1, (now - t0) / dur), e = p * p * (3 - 2 * p);
        self.setState({ logEps: -2.5 * e });
        if (p < 1) self.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
    componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
    curve(fn, eps) {
      var sx = function (x) { return 44 + 150 * x; };
      var sy = function (v) { return 244 - (Math.log(v) / Math.LN10 + 1) / 3 * 228; };
      var d = '';
      for (var i = 0; i <= 160; i++) {
        var x = 2 * Math.pow(i / 160, 2.2);
        if (eps === 0 && x < 1e-5) x = 1e-5;
        d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + Math.max(-40, Math.min(300, sy(fn(eps + Math.max(x, 0))))).toFixed(1);
      }
      return d;
    }
    renderVals() {
      var self = this, st = this.state, eps = Math.pow(10, st.logEps), g1 = st.g1, g2 = st.g2;
      var psi = function (m) { return Math.pow(m, -1 / g1); };
      var g = function (x) { return Math.pow(x, -g2); };
      var stop = function () { self.touched = true; if (self.raf) cancelAnimationFrame(self.raf); };
      var set = function (key) { return function (e) { stop(); var o = {}; o[key] = parseFloat(e.target.value); self.setState(o); }; };
      var ok = g2 <= g1 + 1e-9;
      return {
        psiSing: this.curve(psi, 0), psiReg: this.curve(psi, eps), gSing: this.curve(g, 0), gReg: this.curve(g, eps),
        logEps: st.logEps, g1: g1, g2: g2, ok: ok, notOk: !ok,
        epsLabel: eps < 0.01 ? sci(eps) : eps.toFixed(3), g1Label: g1.toFixed(2), g2Label: g2.toFixed(2),
        setEps: set('logEps'), setG1: set('g1'), setG2: set('g2')
      };
    }
  }

  SiteFigures.register('couplings', { markup: markup, Component: Component });
})();
