/* Interactive figure: scan paths. Loaded on demand by script.js. */
(function () {
  'use strict';

  var markup = String.raw`
<figure style="margin: 0; font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #203D36; background: #FFFFFF; border: 1px solid #D9DDD2; border-radius: 4px; padding: 24px; box-sizing: border-box; font-size: 15px; line-height: 1.55">
<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center" role="group" aria-label="Scan path">
<button type="button" data-bind="aria-pressed:pressRaster; style:styleRaster" data-on="click:pickRaster">Snake raster</button>
<button type="button" data-bind="aria-pressed:pressSpiral; style:styleSpiral" data-on="click:pickSpiral">Spiral</button>
<button type="button" data-bind="aria-pressed:pressLiss; style:styleLiss" data-on="click:pickLiss">Lissajous</button>
<button type="button" style="font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid #D9DDD2; background: #FFFFFF; color: #203D36; font-size: 14px" data-on="click:replay">Replay</button>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 24px; margin-top: 16px; align-items: start">
<div>
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Sample: 30 features, found ones in rust</p>
<canvas width="600" height="600" role="img" aria-label="The unit square with circular features; the scan path is drawn progressively and features it has passed over are coloured." style="display: block; width: 100%; max-width: 420px; height: auto; aspect-ratio: 1 / 1; background: #F6F5EF" data-ref="setCanvas"></canvas>
<p style="margin: 8px 0 0; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #515C55">distance <span data-text="distLabel"></span> · found <span data-text="foundLabel"></span> / 30<span data-text="completionLabel"></span></p>
</div>
<div style="min-width: 0">
<p style="margin: 0 0 6px; font-size: 13px; color: #515C55">Probability a feature has been found, against distance budget</p>
<svg viewBox="0 0 440 300" role="img" aria-label="Fraction of features found against distance budget. A curve stays flat once its path has ended." style="display: block; width: 100%; height: auto">
<line x1="44" x2="424" y1="20" y2="20" stroke="#EDF0E7"></line>
<line x1="44" x2="424" y1="130" y2="130" stroke="#EDF0E7"></line>
<line x1="44" x2="424" y1="240" y2="240" stroke="#B8C1B6"></line>
<line x1="44" x2="44" y1="20" y2="240" stroke="#B8C1B6"></line>
<text x="36" y="24" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">1</text>
<text x="36" y="134" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0.5</text>
<text x="36" y="244" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">0</text>
<text x="44" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">0</text>
<text x="234" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">5</text>
<text x="424" y="258" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="middle">10</text>
<text x="424" y="276" font-family="IBM Plex Mono, monospace" font-size="11" fill="#657061" text-anchor="end">distance budget</text>
<line y1="20" y2="240" stroke="#D9DDD2" stroke-dasharray="3 3" data-bind="x1:markX; x2:markX"></line>
<path fill="none" data-bind="d:curveRaster; stroke:colRaster; stroke-width:wRaster"></path>
<path fill="none" data-bind="d:curveSpiral; stroke:colSpiral; stroke-width:wSpiral"></path>
<path fill="none" data-bind="d:curveLiss; stroke:colLiss; stroke-width:wLiss"></path>
<text font-family="IBM Plex Mono, monospace" font-size="10" fill="#515C55" text-anchor="end" data-bind="x:lxRaster; y:lyRaster">raster</text>
<text font-family="IBM Plex Mono, monospace" font-size="10" fill="#515C55" text-anchor="end" data-bind="x:lxSpiral; y:lySpiral">spiral</text>
<text font-family="IBM Plex Mono, monospace" font-size="10" fill="#515C55" text-anchor="end" data-bind="x:lxLiss; y:lyLiss">Lissajous</text>
</svg>
<label style="display: flex; flex-direction: column; gap: 2px; margin-top: 12px; font-size: 13px; color: #515C55">
<span>feature radius \(\rho =\) <span style="font-family: 'IBM Plex Mono', monospace"><span data-text="rhoLabel"></span></span></span>
<input type="range" min="0.01" max="0.08" step="0.005" style="accent-color: #244F46; width: 100%; height: 28px; margin: 0" data-bind="value:rho" data-on="input:setRho">
</label>
</div>
</div>
<figcaption style="margin-top: 14px; font-size: 14px; color: #515C55">Features are discs of radius \(\rho\) with centres uniform on the unit square; the beam has radius 0.01. Contacts are checked at distance increments of 0.004. All three paths move at the same speed until their endpoint or a distance budget of 10; the spiral ends at about 7.88 and its discovery probability then stays constant. The raster and spiral use line spacing 0.1. The curves are Monte Carlo estimates over 600 features. This illustrates the project's trade-off using synthetic paths: the spiral covers the centre quickly but leaves the corners, the raster extends coverage across the square, and the Lissajous path revisits regions it has already scanned.</figcaption>
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
      var btn = function (on) {
        return 'font: inherit; cursor: pointer; min-height: 44px; padding: 0 18px; border-radius: 999px; font-size: 14px; border: 1px solid #244F46; background: ' + (on ? '#244F46' : '#FFFFFF') + '; color: ' + (on ? '#FFFFFF' : '#244F46');
      };
      var pick = function (k) { return function () { self.setState({ path: k }, function () { self.play(); }); }; };
      var out = {
        setCanvas: this.setCanvas, rho: st.rho, rhoLabel: st.rho.toFixed(3),
        distLabel: distance.toFixed(2), foundLabel: String(found), markX: (44 + 38 * distance).toFixed(1),
        completionLabel: distance >= end && end < this.Lmax ? ' · path complete' : '',
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
        out['style' + p[1]] = btn(on);
        out['curve' + p[1]] = self.curves[p[0]].d;
        out['col' + p[1]] = on ? '#9D5C3E' : '#A3ACA0';
        out['w' + p[1]] = on ? 2.4 : 1.4;
        out['lx' + p[1]] = 420;
      });
      // Stack the end labels above their curves without letting them overlap.
      var labels = [['Raster', 'raster'], ['Spiral', 'spiral'], ['Liss', 'liss']].map(function (p) {
        return { key: p[0], y: 240 - 220 * self.curves[p[1]].end - 6 };
      }).sort(function (a, b) { return a.y - b.y; });
      for (var i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + 12);
      labels.forEach(function (l) { out['ly' + l.key] = l.y.toFixed(1); });
      return out;
    }
  }

  SiteFigures.register('scan', { markup: markup, Component: Component });
})();
