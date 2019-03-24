const NATIVE_PAGE_EVENTS = {
  // @todo Is it right to define LOAD with domcontentloaded ??
  LOAD: 'domcontentloaded',
  CLOSE: 'close',
  PAGE_ERROR: 'pageerror'
}

const PAGE_EVENTS = {
  ...NATIVE_PAGE_EVENTS,
  BEFORE_OPEN: 'beforeopen',
  RELOAD: 'reload'
}

module.exports = {
  NATIVE_PAGE_EVENTS,
  PAGE_EVENTS
}