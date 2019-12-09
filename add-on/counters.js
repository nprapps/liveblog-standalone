var props = PropertiesService.getScriptProperties();

function getCounterValue() {
  var current = props.getProperty("guid") || 0;
  current++;
  props.setProperty("guid", current);
  return current;
}

function resetCounter() {
  props.setProperty("guid", 0);
}