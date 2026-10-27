/* Peter Crew — page behaviour: maths rendering and the expandable figures. */
(function () {
  'use strict';

  window.SiteMathOptions = {
    delimiters: [
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false }
    ],
    throwOnError: false
  };

  function renderMath(root) {
    if (window.renderMathInElement) window.renderMathInElement(root, window.SiteMathOptions);
  }

  // Figure scripts are fetched the first time a figure is opened.
  var loading = {};
  function loadFigure(name) {
    if (window.SiteFigures && window.SiteFigures.has(name)) return Promise.resolve();
    if (!loading[name]) {
      loading[name] = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'assets/js/figures/' + name + '.js';
        s.onload = resolve;
        s.onerror = function () { delete loading[name]; reject(new Error('Could not load ' + s.src)); };
        document.head.appendChild(s);
      });
    }
    return loading[name];
  }

  function mountInto(name, host) {
    host.innerHTML = '<p class="fig-loading">Loading figure…</p>';
    return loadFigure(name).then(function () {
      return window.SiteFigures.mount(name, host);
    }).catch(function () {
      host.innerHTML = '<p class="fig-error">The figure could not be loaded. Please reload the page and try again.</p>';
      return null;
    });
  }

  function setExpanded(button, panel, open) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  // Single figures: one button, one panel.
  document.querySelectorAll('[data-figure]').forEach(function (button) {
    var name = button.getAttribute('data-figure');
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    var current = null;
    var pending = 0;
    button.hidden = false;
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      setExpanded(button, panel, open);
      pending += 1;
      var ticket = pending;
      if (open) {
        mountInto(name, panel).then(function (fig) {
          if (ticket !== pending) { window.SiteFigures.unmount(fig); return; }
          current = fig;
        });
      } else {
        window.SiteFigures.unmount(current);
        current = null;
        panel.innerHTML = '';
      }
    });
  });

  // Tabbed figures: one button opens a panel showing one figure at a time.
  document.querySelectorAll('[data-figure-tabs]').forEach(function (button) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    var tabs = Array.prototype.slice.call(panel.querySelectorAll('[role="tab"]'));
    var host = panel.querySelector('[role="tabpanel"]');
    var current = null;
    var pending = 0;
    var active = tabs[0].getAttribute('data-tab');

    function show(name) {
      active = name;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === name;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on) host.setAttribute('aria-labelledby', t.id);
      });
      window.SiteFigures.unmount(current);
      current = null;
      pending += 1;
      var ticket = pending;
      mountInto(name, host).then(function (fig) {
        if (ticket !== pending) { window.SiteFigures.unmount(fig); return; }
        current = fig;
      });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { if (t.getAttribute('data-tab') !== active) show(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (j === null) return;
        e.preventDefault();
        var next = tabs[(j + tabs.length) % tabs.length];
        next.focus();
        show(next.getAttribute('data-tab'));
      });
    });

    button.hidden = false;
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      setExpanded(button, panel, open);
      if (open) {
        show(active);
      } else {
        pending += 1;
        window.SiteFigures.unmount(current);
        current = null;
        host.innerHTML = '';
      }
    });
  });

  renderMath(document.getElementById('main'));
})();
