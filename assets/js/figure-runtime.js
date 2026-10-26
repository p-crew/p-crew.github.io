/*
  Minimal runtime for the interactive figures.

  Each file in assets/js/figures/ registers a figure with
  SiteFigures.register(name, { markup, Component }). The markup uses
  data attributes that are filled from the object returned by the
  component's renderVals():

    data-bind="attr:key; attr:key"   set attributes (value sets the property)
    data-text="key"                  set text content
    data-show="key"                  show the element only when truthy
    data-on="event:key"              call the handler vals[key](event)
    data-ref="key"                   call vals[key](element) once, after mounting
    data-for="key" data-as="item"    repeat data-tpl once per entry of vals[key],
      data-tpl="..."                 replacing {{item.prop}}

  Components extend SiteFigure and use this.state / this.setState() and the
  optional componentDidMount() / componentWillUnmount() hooks.
*/
(function () {
  'use strict';

  var registry = {};

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pairs(spec) {
    return spec.split(';').map(function (part) {
      var i = part.indexOf(':');
      return [part.slice(0, i).trim(), part.slice(i + 1).trim()];
    }).filter(function (p) { return p[0] && p[1]; });
  }

  function collect(root) {
    var b = { attrs: [], texts: [], shows: [], fors: [], ons: [], refs: [] };
    root.querySelectorAll('[data-bind]').forEach(function (el) {
      pairs(el.getAttribute('data-bind')).forEach(function (p) { b.attrs.push({ el: el, attr: p[0], key: p[1] }); });
    });
    root.querySelectorAll('[data-text]').forEach(function (el) { b.texts.push({ el: el, key: el.getAttribute('data-text') }); });
    root.querySelectorAll('[data-show]').forEach(function (el) { b.shows.push({ el: el, key: el.getAttribute('data-show') }); });
    root.querySelectorAll('[data-for]').forEach(function (el) {
      b.fors.push({ el: el, key: el.getAttribute('data-for'), as: el.getAttribute('data-as'), tpl: el.getAttribute('data-tpl'), last: null });
    });
    root.querySelectorAll('[data-on]').forEach(function (el) {
      pairs(el.getAttribute('data-on')).forEach(function (p) { b.ons.push({ el: el, type: p[0], key: p[1] }); });
    });
    root.querySelectorAll('[data-ref]').forEach(function (el) { b.refs.push({ el: el, key: el.getAttribute('data-ref') }); });
    return b;
  }

  function apply(b, v) {
    b.attrs.forEach(function (x) {
      var val = v[x.key];
      if (x.attr === 'value') {
        if (String(x.el.value) !== String(val)) x.el.value = val;
      } else if (val === null || val === undefined || val === false) {
        x.el.removeAttribute(x.attr);
      } else {
        x.el.setAttribute(x.attr, String(val));
      }
    });
    b.texts.forEach(function (x) {
      var val = v[x.key] === undefined ? '' : String(v[x.key]);
      if (x.el.textContent !== val) x.el.textContent = val;
    });
    b.shows.forEach(function (x) { x.el.style.display = v[x.key] ? '' : 'none'; });
    b.fors.forEach(function (x) {
      var list = v[x.key] || [];
      var re = new RegExp('\\{\\{\\s*' + x.as + '\\.(\\w+)\\s*\\}\\}', 'g');
      var html = list.map(function (item) {
        return x.tpl.replace(re, function (_, prop) { return escapeHtml(item[prop]); });
      }).join('');
      if (html !== x.last) { x.el.innerHTML = html; x.last = html; }
    });
  }

  class SiteFigure {
    constructor(root) {
      this.root = root;
      this.state = {};
      this._mounted = false;
    }
    setState(patch, done) {
      var next = typeof patch === 'function' ? patch(this.state) : patch;
      this.state = Object.assign({}, this.state, next);
      if (this._mounted) this._render();
      if (done) done.call(this);
    }
    renderVals() { return {}; }
    _render() {
      this._vals = this.renderVals();
      apply(this._bindings, this._vals);
    }
  }

  function mount(name, container) {
    var def = registry[name];
    if (!def) throw new Error('Unknown figure: ' + name);
    container.innerHTML = def.markup;
    if (window.renderMathInElement) window.renderMathInElement(container, window.SiteMathOptions);
    var fig = new def.Component(container);
    fig._bindings = collect(container);
    fig._bindings.ons.forEach(function (x) {
      x.el.addEventListener(x.type, function (e) {
        var handler = fig._vals && fig._vals[x.key];
        if (handler) handler(e);
      });
    });
    fig._mounted = true;
    fig._render();
    fig._bindings.refs.forEach(function (x) {
      var handler = fig._vals[x.key];
      if (handler) handler(x.el);
    });
    if (fig.componentDidMount) fig.componentDidMount();
    return fig;
  }

  function unmount(fig) {
    if (!fig) return;
    if (fig.componentWillUnmount) fig.componentWillUnmount();
    fig._mounted = false;
    fig.root.innerHTML = '';
  }

  window.SiteFigure = SiteFigure;
  window.SiteFigures = {
    register: function (name, def) { registry[name] = def; },
    has: function (name) { return Object.prototype.hasOwnProperty.call(registry, name); },
    mount: mount,
    unmount: unmount
  };
})();
