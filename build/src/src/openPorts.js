const upnpc = require("./upnpc");
const logs = require("./logs.js")(module);

// Ports to open:
const ports = [
  // - OpenVPN: 1194 UDP
  { protocol: "UDP", portNumber: 1194 },
  // - SSH: 22 TCP (Ignore)
  // {protocol: 'TCP', portNumber: 22},
  // - Alt HTTP: 8080 TCP
  { protocol: "TCP", portNumber: 8090 },
  // - ETH: 30303 TCP, 30303 UDP
  { protocol: "TCP", portNumber: 30303 },
  { protocol: "UDP", portNumber: 30303 },
  // - IPFS: 4001 TCP, 4002 UDP
  { protocol: "TCP", portNumber: 4001 },
  { protocol: "UDP", portNumber: 4002 }
];

const portId = port => `${port.portNumber} ${port.protocol}`;

async function openPorts() {
  // 1. Get the list of ports and check there is a UPnP device
  // portMappings = [ {protocol: 'UDP', exPort: '500', inPort: '500'} ]
  let currentPortMappings;
  try {
    currentPortMappings = await upnpc.list();
  } catch (e) {
    if (e.message.includes("NOUPNP")) {
      logs.warn("No UPnP device available, skipping the open ports scripts");
      return;
    } else {
      throw e;
    }
  }

  // 2. If the port is already open, ignore
  const portsToOpen = ports.filter(port => {
    const currentPort = (currentPortMappings || []).find(
      p =>
        p.protocol === port.protocol &&
        p.exPort === String(port.portNumber) &&
        p.inPort === String(port.portNumber)
    );
    if (currentPort) {
      logs.info(`Port ${portId(port)} is already mapped, ignoring`);
      return false;
    } else {
      return true;
    }
  });

  // 3. Otherwise, close the port and then open it
  for (const portToOpen of portsToOpen) {
    try {
      await upnpc.close(portToOpen);
    } catch (e) {
      // Errors while closing a port before openning do not matter.
      logs.warn(
        `(May not matter): Error closing port ${portId(portToOpen)}: ${
          e.message
        }`
      );
    }
    try {
      await upnpc.open(portToOpen);
    } catch (e) {
      // Error stack of shell processes do not matter. The message contains all the info
      logs.error(`Error openning port ${portId(portToOpen)}: ${e.message}`);
    }
  }

  // 4. Verify that the ports have been openned
  if (portsToOpen.length) {
    const nextPortMappings = await upnpc.list();
    for (const portToOpen of portsToOpen) {
      const currentPort = nextPortMappings.find(
        p =>
          p.protocol === portToOpen.protocol &&
          p.exPort === String(portToOpen.portNumber) &&
          p.inPort === String(portToOpen.portNumber)
      );
      if (currentPort) {
        logs.info(`Port ${portId(portToOpen)} verified. It is currently open`);
      } else {
        logs.error(`Error, port ${portId(portToOpen)} is not currently open`);
      }
    }
  }
}

module.exports = openPorts;
