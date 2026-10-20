'use strict';
// Make Next's HTTP server bind with SO_REUSEPORT so a replacement instance
// can start on the same port while the old one is still up. That lets
// deploy/restart.sh do a zero-downtime cutover: start new, then kill old,
// with no gap where the port is unbound. Loaded via NODE_OPTIONS=--require.
const net = require('net');
const originalListen = net.Server.prototype.listen;

net.Server.prototype.listen = function (...args) {
  const first = args[0];

  // options-object form: listen({ port, host, ... }, [cb])
  if (first && typeof first === 'object' && !Buffer.isBuffer(first) && !Array.isArray(first)) {
    if (!('reusePort' in first)) {
      return originalListen.call(this, Object.assign({}, first, { reusePort: true }), ...args.slice(1));
    }
    return originalListen.call(this, ...args);
  }

  // positional form: listen(port[, host][, backlog][, cb])
  const port = first;
  let host;
  let backlog;
  let cb;
  for (const a of args.slice(1)) {
    if (typeof a === 'function') cb = a;
    else if (typeof a === 'string') host = a;
    else if (typeof a === 'number') backlog = a;
  }
  const opts = { port, reusePort: true };
  if (host !== undefined) opts.host = host;
  if (backlog !== undefined) opts.backlog = backlog;
  return originalListen.call(this, opts, cb);
};
