export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function mergeStyles(...styles) {
  return Object.assign({}, ...styles.filter(Boolean));
}
