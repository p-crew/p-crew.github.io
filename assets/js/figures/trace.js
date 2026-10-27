/* Interactive figure: HMM decoding of a synthetic intensity trace. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure class="fig">
<div class="fig-head">
<p class="fig-title">Decoding a fluorescence trace</p>
<p class="fig-lead">In a synthetic two-dye trace, the molecule switches between a high state H and a quenched state Q until one dye photobleaches (PB), then the other (Z). Noise hides the switches; the Viterbi algorithm recovers the most likely sequence of states.</p>
</div>
<ul class="fig-legend">
<li><span class="sw c-grey"></span>observed intensity</li>
<li><span class="sw c-teal"></span>true state</li>
<li><span class="sw dash c-rust"></span>Viterbi decoding</li>
</ul>
<svg viewBox="0 0 880 320" role="img" aria-label="A noisy synthetic intensity trace over 600 frames, with the true hidden state and the decoded state drawn as step functions.">
<g stroke="#EDF0E7">
<line x1="56" x2="864" data-bind="y1:yH; y2:yH"></line>
<line x1="56" x2="864" data-bind="y1:yQ; y2:yQ"></line>
<line x1="56" x2="864" data-bind="y1:yP; y2:yP"></line>
<line x1="56" x2="864" data-bind="y1:yZ; y2:yZ"></line>
</g>
<path d="M56 16V296H864" fill="none" stroke="#B8C1B6"></path>
<g font-family="IBM Plex Mono, monospace" font-size="14" fill="#657061" text-anchor="end">
<text x="48" data-bind="y:tH">H</text>
<text x="48" data-bind="y:tQ">Q</text>
<text x="48" data-bind="y:tP">PB</text>
<text x="48" data-bind="y:tZ">Z</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="14" fill="#657061">
<text x="56" y="314" text-anchor="middle">0</text>
<text x="325.8" y="314" text-anchor="middle">200</text>
<text x="595.6" y="314" text-anchor="middle">400</text>
<text x="864" y="314" text-anchor="end">600 frames</text>
</g>
<path fill="none" stroke="#A3ACA0" stroke-width="1" data-bind="d:obs"></path>
<path fill="none" stroke="#244F46" stroke-width="2.4" stroke-linejoin="round" data-bind="d:truth"></path>
<path fill="none" stroke="#9D5C3E" stroke-width="1.6" stroke-dasharray="5 3" stroke-linejoin="round" data-bind="d:dec"></path>
</svg>
<div class="fig-controls">
<label class="fig-slider"><span>Noise level \(s\) <span class="v" data-text="sLabel"></span></span>
<input type="range" min="0.04" max="0.4" step="0.01" aria-label="noise level s" data-bind="value:s" data-on="input:setS"></label>
<div class="fig-actions"><button type="button" class="fig-btn solid" data-on="click:again">New trace</button></div>
</div>
<dl class="fig-readout">
<div><dt>Frames decoded correctly</dt><dd data-text="acc"></dd></div>
</dl>
<figcaption class="fig-caption">A four-state hidden Markov model with Gaussian emissions \(\mathcal{N}(\mu_k, s^2)\), decoded with its true parameters. Levels and rates are illustrative; no project data is shown.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { s: 0.14, seed: 3 };
      this.mu = [1, 0.62, 0.42, 0];
      var stay = [0.96, 0.95, 0.992, 1];
      this.P = [
        [stay[0], 0.04 - 0.003, 0.003, 0],
        [0.05 - 0.004, stay[1], 0.004, 0],
        [0, 0, stay[2], 1 - stay[2]],
        [0, 0, 0, 1]
      ];
      this.T = 600;
      this.generate(3);
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
    generate(seed) {
      var r = this.rng(seed), T = this.T, P = this.P;
      for (var attempt = 0; attempt < 50; attempt++) {
        var z = new Uint8Array(T), k = 0;
        for (var t = 0; t < T; t++) {
          z[t] = k;
          var u = r(), acc = 0, next = 3;
          for (var j = 0; j < 4; j++) { acc += P[k][j]; if (u < acc) { next = j; break; } }
          k = next;
        }
        if (z[T - 1] === 3 && z[Math.floor(T * 0.35)] < 2) break;
      }
      var n = new Float64Array(T);
      for (var i = 0; i < T; i++) n[i] = Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
      this.z = z;
      this.noise = n;
    }
    viterbi(y, s) {
      var T = y.length, K = 4, mu = this.mu, lp = this.P.map(function (row) { return row.map(function (p) { return p > 0 ? Math.log(p) : -Infinity; }); });
      var V = new Float64Array(K), back = [], z = new Uint8Array(T);
      for (var k = 0; k < K; k++) V[k] = (k === 0 ? 0 : -Infinity) - (y[0] - mu[k]) * (y[0] - mu[k]) / (2 * s * s);
      for (var t = 1; t < T; t++) {
        var W = new Float64Array(K), b = new Uint8Array(K);
        for (var j = 0; j < K; j++) {
          var best = -Infinity, arg = 0;
          for (var i = 0; i < K; i++) { var v = V[i] + lp[i][j]; if (v > best) { best = v; arg = i; } }
          W[j] = best - (y[t] - mu[j]) * (y[t] - mu[j]) / (2 * s * s);
          b[j] = arg;
        }
        back.push(b);
        V = W;
      }
      var last = 0;
      for (var m = 1; m < K; m++) if (V[m] > V[last]) last = m;
      z[T - 1] = last;
      for (var u = T - 1; u > 0; u--) z[u - 1] = back[u - 1][z[u]];
      return z;
    }
    renderVals() {
      var self = this, st = this.state, T = this.T, mu = this.mu, s = st.s;
      var X = function (t) { return 56 + 808 * t / (T - 1); };
      var y = new Float64Array(T);
      for (var t = 0; t < T; t++) y[t] = mu[this.z[t]] + s * this.noise[t];
      var lo = Math.min(0, Math.min.apply(null, y)), hi = Math.max(1, Math.max.apply(null, y));
      var pad = 0.08 * (hi - lo);
      lo = Math.floor((lo - pad) * 10) / 10; hi = Math.ceil((hi + pad) * 10) / 10;
      var Y = function (v) { return 296 - 280 * (v - lo) / (hi - lo); };
      var dec = this.viterbi(y, s), ok = 0;
      var obs = '', truth = '', dd = '';
      for (var i = 0; i < T; i++) {
        obs += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y[i]).toFixed(1);
        truth += (i ? 'L' + X(i).toFixed(1) + ' ' + Y(mu[this.z[i - 1]]).toFixed(1) + 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(mu[this.z[i]]).toFixed(1);
        dd += (i ? 'L' + X(i).toFixed(1) + ' ' + Y(mu[dec[i - 1]]).toFixed(1) + 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(mu[dec[i]]).toFixed(1);
        if (dec[i] === this.z[i]) ok++;
      }
      return {
        obs: obs, truth: truth, dec: dd,
        yMinLabel: lo.toFixed(1), yMaxLabel: hi.toFixed(1),
        yH: Y(mu[0]), yQ: Y(mu[1]), yP: Y(mu[2]), yZ: Y(mu[3]),
        tH: Y(mu[0]) + 4, tQ: Y(mu[1]) + 4, tP: Y(mu[2]) + 4, tZ: Y(mu[3]) + 4,
        s: s, sLabel: s.toFixed(2), acc: (100 * ok / T).toFixed(1) + '%',
        setS: function (e) { self.setState({ s: parseFloat(e.target.value) }); },
        again: function () { var sd = st.seed + 1; self.generate(sd); self.setState({ seed: sd }); }
      };
    }
  }

  SiteFigures.register('trace', { markup: markup, Component: Component });
})();
