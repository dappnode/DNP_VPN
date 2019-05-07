function setIntervalAndRun(fn, t) {
  fn();
  return setInterval(fn, t);
}

module.exports = setIntervalAndRun;
