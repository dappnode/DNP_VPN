import os from 'os';
import { logs } from '../logs';

export function getDockerContainerIP(): string | null {
    const networkInterfaces = os.networkInterfaces();

    // Docker typically uses eth0 as the first network interface for bridge networks
    const eth0 = networkInterfaces['eth0'];

    if (!eth0) {
        logs.error('Network interface eth0 not found.');
        return null;
    }

    // Filter for IPv4 address
    const ipv4 = eth0.find(info => info.family === 'IPv4');

    if (!ipv4) {
        console.error('IPv4 address for eth0 not found.');
        return null;
    }

    return ipv4.address;
}
