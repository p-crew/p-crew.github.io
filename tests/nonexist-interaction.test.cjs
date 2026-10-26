/* GBM intro/interaction regressions. Run: node --test tests/nonexist-interaction.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

function load(reducedMotion = false) {
  let definition, nextId = 0;
  const frames = new Map();
  class SiteFigure {
    constructor() { this.state = {}; }
    setState(patch) { Object.assign(this.state, patch); }
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/figures/nonexist.js'), 'utf8'), {
    SiteFigure, SiteFigures: { register: (_, def) => { definition = def; } },
    window: { matchMedia: () => ({ matches: reducedMotion }) },
    performance: { now: () => 0 },
    requestAnimationFrame(fn) { const id = ++nextId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); }
  });
  const figure = new definition.Component();
  figure.componentDidMount();
  function tick(ms) {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(fn => fn(ms));
  }
  return { figure, frames, tick };
}

function pointer(pointerType = 'mouse') {
  let captured = null;
  const svg = {
    getBoundingClientRect: () => ({ left: 80, top: 100, width: 600, height: 360 }),
    setPointerCapture(id) { captured = id; },
    hasPointerCapture(id) { return captured === id; },
    releasePointerCapture() { captured = null; }
  };
  return (type, sig = 0.1, mu = 0.05) => ({
    type, currentTarget: svg, pointerType, pointerId: 7, button: 0,
    clientX: 80 + 56 + 520 * sig / 0.6,
    clientY: 100 + 320 - 296 * (mu + 0.1) / 0.4,
    preventDefault() {}
  });
}

function assertCrossings(figure, count) {
  const out = figure.renderVals();
  assert.equal(out.paths.length, 40);
  assert.equal(out.negLabel, count + ' / 40');
  assert.equal(out.paths.filter(p => p.color === '#9D5C3E').length, count);
  // Check plotted coordinates as well as the readout and stroke colours.
  assert.equal(out.paths.filter(p => Number(p.d.split(' ').at(-1)) > Number(out.zeroY)).length, count);
}

test('GBM uninterrupted intro still reaches its original horizon and rust crossings', () => {
  const { figure, frames, tick } = load();
  tick(1000);
  assert.equal(figure.state.T, 5.5);
  assertCrossings(figure, 0);
  tick(6000);
  assert.equal(figure.state.T, 65);
  assertCrossings(figure, 40);
  assert.equal(frames.size, 0);
});

for (const pointerType of ['mouse', 'touch']) {
  test('GBM early ' + pointerType + ' drag completes the intro instead of freezing a short horizon', () => {
    for (const time of [0, 1000, 3000]) {
      const { figure, frames, tick } = load();
      tick(time);
      const staleFrame = [...frames.values()][0];
      const event = pointer(pointerType);
      figure.pickStart(event('pointerdown'));
      assert.equal(figure.state.T, 65);
      assertCrossings(figure, 40);
      assert.equal(frames.size, 0);
      staleFrame(2000); // An already queued callback must not reset the horizon.
      assert.equal(figure.state.T, 65);
      figure.pickMove(event('pointermove', 0.25, 0.1));
      assertCrossings(figure, 0);
      figure.pickMove(event('pointermove', 0.1, 0.1));
      assertCrossings(figure, 40);
      figure.pickEnd(event('pointerup', 0.1, 0.1));
      assert.equal(figure.activePointer, null);
    }
  });
}

test('GBM keyboard and non-horizon sliders finish an interrupted intro', () => {
  for (const [key, value] of [['setMu', '0.05'], ['setSig', '0.1'], ['setG', '2'], ['setR', '0.02'], ['setD', '0.05']]) {
    const { figure, frames, tick } = load();
    tick(1000);
    figure.renderVals()[key]({ target: { value } });
    assert.equal(figure.state.T, 65);
    assertCrossings(figure, 40);
    assert.equal(frames.size, 0);
  }
  const { figure, tick } = load();
  tick(1000);
  figure.pickKey({ key: 'ArrowUp', preventDefault() {} });
  assert.equal(figure.state.T, 65);
  assert.equal(figure.state.mu, 0.055);
  assertCrossings(figure, 40);
});

test('GBM explicit horizon choices are preserved through all later interactions', () => {
  for (const time of [1000, 6000]) {
    const { figure, frames, tick } = load();
    tick(time);
    figure.renderVals().setT({ target: { value: '40' } });
    const event = pointer();
    figure.pickStart(event('pointerdown'));
    figure.pickMove(event('pointermove'));
    figure.pickEnd(event('pointerup'));
    figure.renderVals().setG({ target: { value: '2' } });
    figure.pickKey({ key: 'ArrowUp', preventDefault() {} });
    figure.pickKey({ key: 'ArrowDown', preventDefault() {} });
    tick(9000);
    assert.equal(figure.state.T, 40);
    assertCrossings(figure, 0);
    figure.renderVals().setT({ target: { value: '80' } });
    figure.pickStart(event('pointerdown'));
    assert.equal(figure.state.T, 80);
    assertCrossings(figure, 40);
    assert.equal(frames.size, 0);
  }
});

test('GBM reduced-motion mount keeps crossings without scheduling animation', () => {
  const { figure, frames } = load(true);
  assert.equal(figure.state.T, 65);
  assertCrossings(figure, 40);
  assert.equal(frames.size, 0);
  figure.renderVals().setT({ target: { value: '40' } });
  figure.pickStart(pointer()('pointerdown'));
  assert.equal(figure.state.T, 40);
  assertCrossings(figure, 0);
});

test('GBM unmount cancels the intro without rendering or completing it', () => {
  const { figure, frames, tick } = load();
  tick(1000);
  const staleFrame = [...frames.values()][0];
  const before = JSON.stringify(figure.state);
  figure.setState = () => assert.fail('Unmount must not update state');
  figure.componentWillUnmount();
  assert.equal(frames.size, 0);
  staleFrame(6000);
  assert.equal(JSON.stringify(figure.state), before);
  assert.equal(frames.size, 0);
});
