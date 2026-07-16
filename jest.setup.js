// npm install --save-dev canvas


if (global.performance && !global.performance.mark) {
  global.performance.mark = () => {};
  global.performance.measure = () => {};
  global.performance.clearMarks = () => {};
  global.performance.clearMeasures = () => {};
}

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
} else {
  global.window.structuredClone = global.structuredClone;
}