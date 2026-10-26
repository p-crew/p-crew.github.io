/* Interactive figure: regularised couplings. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 20px">
<div>
<p style="margin: 0 0 4px; font-size: 14px">Feedback shape  \(\psi_\varepsilon(m) = (\varepsilon + m^+)^{-1/\gamma_1}\)</p>
<svg viewBox="0 0 360 272" role="img" aria-label="The consumption feedback map on a log scale: the singular map blows up as m tends to zero, the regularised map stays bounded." style="display: block; width: 100%; height: auto">
<defs><clipPath id="cpPsi"><rect x="44" y="16" width="300" height="228"></rect></clipPath></defs>
<line x1="44" x2="344" y1="16" y2="16" stroke="#EDF0E7"></line>
<line x1="44" x2="344" y1="92" y2="92" stroke="#EDF0E7"></line>
<line x1="44" x2="344" y1="168" y2="168" stroke="#EDF0E7"></line>
<line x1="44" x2="344" y1="244" y2="244" stroke="#B8C1B6"></line>
<line x1="44" x2="44" y1="16" y2="244" stroke="#9D5C3E" stroke-width="1.5"></line>
<text x="36" y="20" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">100</text>
<text x="36" y="96" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">10</text>
<text x="36" y="172" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">1</text>
<text x="36" y="248" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0.1</text>
<text x="44" y="262" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">0</text>
<text x="194" y="262" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">1</text>
<text x="344" y="262" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">2</text>
<text x="300" y="236" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="#657061">m</text>
<g clip-path="url(#cpPsi)" fill="none" stroke-linecap="round">
<path stroke="#A3ACA0" stroke-width="1.4" stroke-dasharray="3 4" data-bind="d:psiSing"></path>
<path stroke="#244F46" stroke-width="2" data-bind="d:psiReg"></path>
</g>
</svg>
</div>
<div>
<p style="margin: 0 0 4px; font-size: 14px">Terminal coupling  \(g_\varepsilon(w) = \lambda(\varepsilon + w^+)^{-\gamma_2}\)</p>
<svg viewBox="0 0 360 272" role="img" aria-label="The terminal marginal utility on a log scale: the singular map blows up as terminal wealth tends to zero, the regularised map stays bounded." style="display: block; width: 100%; height: auto">
<defs><clipPath id="cpG"><rect x="44" y="16" width="300" height="228"></rect></clipPath></defs>
<line x1="44" x2="344" y1="16" y2="16" stroke="#EDF0E7"></line>
<line x1="44" x2="344" y1="92" y2="92" stroke="#EDF0E7"></line>
<line x1="44" x2="344" y1="168" y2="168" stroke="#EDF0E7"></line>
<line x1="44" x2="344" y1="244" y2="244" stroke="#B8C1B6"></line>
<line x1="44" x2="44" y1="16" y2="244" stroke="#9D5C3E" stroke-width="1.5"></line>
<text x="36" y="20" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">100</text>
<text x="36" y="96" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">10</text>
<text x="36" y="172" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">1</text>
<text x="36" y="248" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0.1</text>
<text x="44" y="262" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">0</text>
<text x="194" y="262" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">1</text>
<text x="344" y="262" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">2</text>
<text x="296" y="236" font-family="Newsreader, serif" font-style="italic" font-size="15" fill="#657061">w<tspan font-size="11" dy="3">T</tspan></text>
<g clip-path="url(#cpG)" fill="none" stroke-linecap="round">
<path stroke="#A3ACA0" stroke-width="1.4" stroke-dasharray="3 4" data-bind="d:gSing"></path>
<path stroke="#244F46" stroke-width="2" data-bind="d:gReg"></path>
</g>
</svg>
</div>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap: 12px 24px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #EDF0E7">
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #515C55">
<span>\(\varepsilon =\) <span style="font-family: 'IBM Plex Mono', monospace; font-size: 13px"><span data-text="epsLabel"></span></span></span>
<input type="range" min="-3" max="0" step="0.01" aria-label="log10 epsilon" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:logEps" data-on="input:setEps">
</label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #515C55">
<span>\(\gamma_1 =\) <span style="font-family: 'IBM Plex Mono', monospace; font-size: 13px"><span data-text="g1Label"></span></span></span>
<input type="range" min="0.3" max="3" step="0.05" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:g1" data-on="input:setG1">
</label>
<label style="display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #515C55">
<span>\(\gamma_2 =\) <span style="font-family: 'IBM Plex Mono', monospace; font-size: 13px"><span data-text="g2Label"></span></span></span>
<input type="range" min="0.3" max="3" step="0.05" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:g2" data-on="input:setG2">
</label>
</div>
<p data-show="ok" style="margin: 12px 0 0; font-size: 14px; color: #244F46">\(\gamma_2 \le \gamma_1\): satisfies the risk-aversion condition for short-time well-posedness of the singular system, under the theorem's other assumptions.</p>
<p data-show="notOk" style="margin: 12px 0 0; font-size: 14px; color: #9D5C3E">\(\gamma_2 > \gamma_1\): outside the short-time well-posedness result.</p>
<figcaption style="margin-top: 12px; font-size: 14px; color: #515C55">The dashed curves are the singular CRRA couplings. The solid curves use \(x^+ = \max(x,0)\): for fixed \(\varepsilon > 0\), the extensions are monotone and globally Lipschitz, as required by the regularised continuation argument. Only non-negative arguments are plotted, with \(\lambda = 1\) and deterministic prefactors normalised to one. Passing to \(\varepsilon \downarrow 0\) requires further positivity, compactness and integrability estimates.</figcaption>
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
        epsLabel: eps < 0.01 ? eps.toExponential(1) : eps.toFixed(3), g1Label: g1.toFixed(2), g2Label: g2.toFixed(2),
        setEps: set('logEps'), setG1: set('g1'), setG2: set('g2')
      };
    }
  }

  SiteFigures.register('couplings', { markup: markup, Component: Component });
})();
