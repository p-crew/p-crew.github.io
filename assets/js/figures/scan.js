/* Interactive figure: scan paths. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure class="fig">
<div class="fig-actions" role="group" aria-label="Scan path">
<button type="button" class="fig-btn" data-bind="aria-pressed:pressRaster" data-on="click:pickRaster">Snake raster</button>
<button type="button" class="fig-btn" data-bind="aria-pressed:pressSpiral" data-on="click:pickSpiral">Spiral</button>
<button type="button" class="fig-btn" data-bind="aria-pressed:pressLiss" data-on="click:pickLiss">Lissajous</button>
</div>
<div class="fig-plots" style="margin-top: 18px">
<div>
<ul class="fig-legend">
<li><span class="sw box c-rust"></span>found</li>
<li><span class="sw box" style="color: #D9DDD2"></span>not yet found</li>
<li><span class="sw c-teal"></span>scan path</li>
</ul>
<canvas width="600" height="600" role="img" aria-label="The unit square with circular features; the scan path is drawn progressively and features it has passed over are coloured." style="max-width: 440px; aspect-ratio: 1 / 1; background: #F6F5EF" data-ref="setCanvas"></canvas>
</div>
<div>
<p class="fig-label">Probability a feature is found within a given distance</p>
<ul class="fig-legend">
<li data-bind="class:lcRaster"><span class="sw"></span>raster</li>
<li data-bind="class:lcSpiral"><span class="sw dash"></span>spiral</li>
<li data-bind="class:lcLiss"><span class="sw dot"></span>Lissajous</li>
</ul>
<svg viewBox="0 0 440 300" role="img" aria-label="Fraction of features found against distance travelled, for the three paths. A curve stays flat once its path has ended.">
<line x1="44" x2="424" y1="130" y2="130" stroke="#EDF0E7"></line>
<path d="M44 20V240H424" fill="none" stroke="#B8C1B6"></path>
<line y1="20" y2="240" stroke="#9D5C3E" stroke-opacity="0.4" stroke-dasharray="3 3" data-bind="x1:markX; x2:markX"></line>
<g font-family="IBM Plex Mono, monospace" font-size="15" fill="#657061" text-anchor="end">
<text x="36" y="244">0</text><text x="36" y="134">0.5</text><text x="36" y="24">1</text>
</g>
<g font-family="IBM Plex Mono, monospace" font-size="15" fill="#657061" text-anchor="middle">
<text x="44" y="260">0</text><text x="234" y="260">5</text><text x="424" y="260">10</text>
</g>
<text x="234" y="284" font-family="IBM Plex Sans, sans-serif" font-size="15" fill="#657061" text-anchor="middle">distance travelled</text>
<g fill="none" stroke-linecap="round">
<path data-bind="d:curveRaster; stroke:colRaster; stroke-width:wRaster"></path>
<path stroke-dasharray="7 5" data-bind="d:curveSpiral; stroke:colSpiral; stroke-width:wSpiral"></path>
<path stroke-dasharray="0.5 5" data-bind="d:curveLiss; stroke:colLiss; stroke-width:wLiss"></path>
</g>
</svg>
<div class="fig-controls" style="grid-template-columns: minmax(0, 1fr)">
<label class="fig-slider"><span>Feature radius \(\rho\) <span class="v" data-text="rhoLabel"></span></span>
<input type="range" min="0.01" max="0.08" step="0.005" aria-label="feature radius rho" data-bind="value:rho" data-on="input:setRho"></label>
<div class="fig-actions"><button type="button" class="fig-btn" data-on="click:replay">Replay</button></div>
</div>
<dl class="fig-readout">
<div><dt>Distance</dt><dd><span data-text="distLabel"></span><span data-text="completionLabel"></span></dd></div>
<div><dt>Found</dt><dd><span data-text="foundLabel"></span> / 30</dd></div>
</dl>
</div>
</div>
<figcaption class="fig-caption">Features are discs of radius \(\rho\) placed uniformly on the unit square; the beam has radius 0.01. All three paths move at the same speed, up to a distance of 10. The spiral finds central features first but ends at 7.88 without reaching the corners; the Lissajous path rescans ground it has covered. Curves are Monte Carlo estimates over 600 features.</figcaption>
</figure>
`;

  class Component extends SiteFigure {
    constructor(root) {
      super(root);
      this.state = { path: 'raster', rho: 0.03, prog: 0 };
      var self = this;
      this.setCanvas = function (el) { self.cv = el; self.draw(); };
      this.ds = 0.004;
      this.Lmax = 10;
      this.paths = { raster: this.build(this.rasterPts()), spiral: this.build(this.spiralPts()), liss: this.build(this.lissPts()) };
      var r = this.rng(5);
      this.mc = [];
      for (var i = 0; i < 600; i++) this.mc.push([r(), r()]);
      this.show = [];
      for (var k = 0; k < 30; k++) this.show.push([r(), r()]);
      this.computeCurves();
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
    rasterPts() {
      var pts = [], h = 0.1, rows = 11;
      for (var i = 0; i < rows; i++) {
        var y = 0.0 + i * h;
        if (i % 2 === 0) { pts.push([0, y]); pts.push([1, y]); } else { pts.push([1, y]); pts.push([0, y]); }
      }
      return pts;
    }
    spiralPts() {
      var pts = [], a = 0.1 / (2 * Math.PI);
      for (var th = 0; a * th <= 0.5; th += 0.02) pts.push([0.5 + a * th * Math.cos(th), 0.5 + a * th * Math.sin(th)]);
      return pts;
    }
    lissPts() {
      var pts = [];
      for (var t = 0; t <= 2 * Math.PI; t += 0.002) pts.push([0.5 + 0.5 * Math.sin(4 * t), 0.5 + 0.5 * Math.sin(5 * t + Math.PI / 4)]);
      return pts;
    }
    build(pts) {
      var out = [pts[0]], ds = this.ds, carry = 0, total = 0;
      for (var i = 1; i < pts.length && total < this.Lmax; i++) {
        var ax = pts[i - 1][0], ay = pts[i - 1][1], dx = pts[i][0] - ax, dy = pts[i][1] - ay, len = Math.hypot(dx, dy), s = ds - carry;
        while (s <= len && total + ds <= this.Lmax + 1e-12) { out.push([ax + dx * s / len, ay + dy * s / len]); total = (out.length - 1) * ds; s += ds; }
        carry = len - (s - ds);
      }
      return out;
    }
    pathLength(key) { return Math.min(this.Lmax, (this.paths[key].length - 1) * this.ds); }
    firstHits(pts, centres, R) {
      var R2 = R * R, hits = new Float64Array(centres.length);
      for (var c = 0; c < centres.length; c++) {
        var cx = centres[c][0], cy = centres[c][1], h = Infinity;
        for (var i = 0; i < pts.length; i++) {
          var dx = pts[i][0] - cx, dy = pts[i][1] - cy;
          if (dx * dx + dy * dy <= R2) { h = i * this.ds; break; }
        }
        hits[c] = h;
      }
      return hits;
    }
    computeCurves(rho) {
      var R = (rho === undefined ? this.state.rho : rho) + 0.01, self = this;
      this.curves = {};
      this.showHits = {};
      ['raster', 'spiral', 'liss'].forEach(function (k) {
        var h = self.firstHits(self.paths[k], self.mc, R), sorted = Array.prototype.slice.call(h).sort(function (a, b) { return a - b; });
        var d = '', n = sorted.length, found = 0;
        for (var j = 0; j <= 100; j++) {
          var L = self.Lmax * j / 100;
          while (found < n && sorted[found] <= L) found++;
          d += (j ? 'L' : 'M') + (44 + 38 * L).toFixed(1) + ' ' + (240 - 220 * found / n).toFixed(1);
        }
        self.curves[k] = { d: d, end: found / n };
        self.showHits[k] = self.firstHits(self.paths[k], self.show, R);
      });
    }
    draw() {
      var el = this.cv;
      if (!el) return;
      var ctx = el.getContext('2d'), S = 600, pad = 24, sc = S - 2 * pad, st = this.state;
      var pts = this.paths[st.path], upto = Math.min(pts.length, Math.floor(st.prog / this.ds) + 1), hits = this.showHits[st.path], L = st.prog;
      ctx.clearRect(0, 0, S, S);
      ctx.strokeStyle = '#D9DDD2'; ctx.lineWidth = 1; ctx.strokeRect(pad, pad, sc, sc);
      for (var k = 0; k < this.show.length; k++) {
        ctx.beginPath();
        ctx.arc(pad + this.show[k][0] * sc, pad + (1 - this.show[k][1]) * sc, st.rho * sc, 0, 2 * Math.PI);
        ctx.fillStyle = hits[k] <= L ? '#9D5C3E' : '#D9DDD2';
        ctx.fill();
      }
      ctx.beginPath();
      for (var i = 0; i < upto; i++) {
        var x = pad + pts[i][0] * sc, y = pad + (1 - pts[i][1]) * sc;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.strokeStyle = '#244F46'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
      if (upto > 0) {
        ctx.beginPath();
        ctx.arc(pad + pts[upto - 1][0] * sc, pad + (1 - pts[upto - 1][1]) * sc, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#203D36'; ctx.fill();
      }
    }
    play() {
      if (this.raf) cancelAnimationFrame(this.raf);
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var self = this, redraw = function () { self.draw(); }, end = this.pathLength(this.state.path);
      if (reduce) { this.setState({ prog: end }, redraw); return; }
      var t0 = performance.now(), dur = 9000;
      var tick = function (now) {
        var distance = Math.min(end, (now - t0) / dur * self.Lmax);
        self.setState({ prog: distance }, redraw);
        if (distance < end) self.raf = requestAnimationFrame(tick);
      };
      this.setState({ prog: 0 }, redraw);
      this.raf = requestAnimationFrame(tick);
    }
    componentDidMount() { this.play(); }
    componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
    renderVals() {
      var self = this, st = this.state, hits = this.showHits[st.path], found = 0, end = this.pathLength(st.path), distance = Math.min(st.prog, end);
      for (var k = 0; k < hits.length; k++) if (hits[k] <= distance) found++;
      var pick = function (k) { return function () { self.setState({ path: k }, function () { self.play(); }); }; };
      var out = {
        setCanvas: this.setCanvas, rho: st.rho, rhoLabel: st.rho.toFixed(3),
        distLabel: distance.toFixed(2), foundLabel: String(found), markX: (44 + 38 * distance).toFixed(1),
        completionLabel: distance >= end && end < this.Lmax ? ' (path complete)' : '',
        pickRaster: pick('raster'), pickSpiral: pick('spiral'), pickLiss: pick('liss'),
        replay: function () { self.play(); },
        setRho: function (e) {
          var v = parseFloat(e.target.value);
          self.computeCurves(v);
          self.setState({ rho: v }, function () { self.draw(); });
        }
      };
      [['raster', 'Raster'], ['spiral', 'Spiral'], ['liss', 'Liss']].forEach(function (p, idx) {
        var on = st.path === p[0], end = self.curves[p[0]].end;
        out['press' + p[1]] = on ? 'true' : 'false';
        out['curve' + p[1]] = self.curves[p[0]].d;
        out['col' + p[1]] = on ? '#9D5C3E' : '#7F8A7D';
        out['w' + p[1]] = on ? 2.6 : 1.6;
        out['lc' + p[1]] = on ? 'c-rust' : null;
      });
      return out;
    }
  }

  SiteFigures.register('scan', { markup: markup, Component: Component });
})();
