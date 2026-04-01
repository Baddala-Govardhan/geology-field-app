/* eslint-disable no-restricted-globals */
// Service worker global scope uses `self` (required by the Workers API).
import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

// self.__WB_MANIFEST is injected at build time by Workbox.
precacheAndRoute(self.__WB_MANIFEST);

// App-shell style routing: serve index.html for navigation requests.
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/_")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// Cache same-origin JS/CSS with a stale-while-revalidate strategy.
registerRoute(
  ({ url }) => url.origin === self.location.origin && (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")),
  new StaleWhileRevalidate({ cacheName: "static-resources" })
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

