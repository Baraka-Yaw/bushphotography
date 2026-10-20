/**
 * Startup file for OpenLiteSpeed's Node app server (`appType node`).
 *
 * LiteSpeed launches this through /usr/local/lsws/fcgi-bin/lsnode.js, which
 * replaces http.Server.prototype.listen and then require()s this file. That has
 * two consequences worth knowing before editing:
 *
 *   1. `next start` cannot be used here — it is a CLI entry point, not a module
 *      that binds a server on require. Next has to be booted programmatically.
 *   2. lsnode checks whether listen() was called as soon as this module finishes
 *      loading, so the server must be bound synchronously below. Awaiting
 *      app.prepare() before listen() would miss that check.
 *
 * Requests arriving before Next has finished preparing wait on the promise
 * rather than being dropped.
 *
 * Only used when the vhost routes `context /` to appserver. Under the proxy
 * vhost this file is inert, though it can be run directly (`node server.js`) to
 * serve on PORT below, which is a useful way to test it in isolation.
 */
const http = require("http");
const next = require("next");

// Both ignored under LiteSpeed: lsnode binds its own LSAPI socket and discards
// whatever is passed to listen(). They only apply when this file is run
// directly, where binding to loopback keeps Node off the public interface --
// it is meant to sit behind LiteSpeed, never to be reached directly.
const PORT = Number(process.env.PORT) || 4300;
const HOST = process.env.HOST || "127.0.0.1";

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

const ready = app.prepare();

http
  .createServer((req, res) => {
    ready
      .then(() => handle(req, res))
      .catch((error) => {
        console.error("Next.js failed to handle the request:", error);
        if (!res.headersSent) res.statusCode = 500;
        res.end("Internal Server Error");
      });
  })
  .listen(PORT, HOST);
