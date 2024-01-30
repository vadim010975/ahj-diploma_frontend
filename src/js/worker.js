const allPorts = [];
self.addEventListener(
  "connect",
  (e) => {
    var port = e.ports[0];
    allPorts.push(port);
    port.addEventListener(
      "message",
      (ev) => {
        const message = ev.data;
        allPorts.forEach((el) => {
          if (port != el) {
            el.postMessage(message);
          }
        });
      },
      false
    );
    e.source.start();
  },
  false
);
