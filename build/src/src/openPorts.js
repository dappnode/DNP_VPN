const upnpc = require('./upnpc');
const logs = require('./logs.js')(module);

// Ports to open:
const ports = [
    // - VPN: 500 UDP, 4500 UDP
    {protocol: 'UDP', portNumber: 500},
    {protocol: 'UDP', portNumber: 4500},
    // - SSH: 22 TCP (Ignore)
    // {protocol: 'TCP', portNumber: 22},
    {protocol: 'UDP', portNumber: 500},
    // - ETH: 30303 TCP, 30303 UDP
    {protocol: 'TCP', portNumber: 30303},
    {protocol: 'UDP', portNumber: 30303},
    // - IPFS: 4001 TCP, 4002 UDP
    {protocol: 'TCP', portNumber: 4001},
    {protocol: 'UDP', portNumber: 4002},
];

const portId = (port) => `${port.portNumber} ${port.protocol}`;

async function openPorts() {
    // 1. Get the list of ports and check there is a UPnP device
    let currentPortMappings;
    try {
        currentPortMappings = await upnpc.list();
    } catch (e) {
        if (e.message.includes('NOUPNP')) {
            logs.warn('No UPnP device available, skipping the open ports scripts');
            return;
        } else {
            throw e;
        }
    }
    // portMappings = [ {protocol: 'UDP', exPort: '500', inPort: '500'} ]

    // 2. If the port is already open, ignore
    const portsToOpen = ports.filter((port) => {
        const currentPort = (currentPortMappings || []).find((p) =>
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
            logs.error(`Error closing port ${portId(portToOpen)}: ${e.stack}`);
        }
        try {
            await upnpc.open(portToOpen);
        } catch (e) {
            logs.error(`Error openning port ${portId(portToOpen)}: ${e.stack}`);
        }
    }

    // 4. Verify that the ports have been openned
    if (portsToOpen.length) {
        const nextPortMappings = await upnpc.list();
        for (const portToOpen of portsToOpen) {
            const currentPort = nextPortMappings.find((p) =>
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
