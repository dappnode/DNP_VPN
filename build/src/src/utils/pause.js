const pause = ms => new Promise(r => setTimeout(r, ms));

module.exports = pause;
