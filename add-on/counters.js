
function getCounterValue() {
  var current = getConfig("guid") || 0;
  current++;
  setConfig({ guid: current });
  return current;
}

function resetCounter() {
  setConfig({ guid: 0 });
}