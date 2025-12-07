// Silence stale baseline-browser-mapping warnings during builds.
process.env.BROWSERSLIST_IGNORE_OLD_DATA = "true";
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = "true";

const warn = console.warn;
console.warn = (...args) => {
  const msg = args.map((a) => String(a)).join(" ");
  if (msg.includes("[baseline-browser-mapping]")) return;
  warn(...args);
};
