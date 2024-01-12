import { Resolver } from 'dns';
import { logs } from '../logs';

export async function getContainerIP(containerName: string): Promise<string | null> {

    const resolver = new Resolver();

    // Use Docker's DNS server to resolve container name.
    resolver.setServers(['127.0.0.11']);

    return new Promise((resolve) => {
        resolver.resolve4(containerName, (err, addresses) => {
            if (err) {
                logs.error(`Error resolving ${containerName} IP address: ${err}`);
                resolve(null);
            } else {
                // Resolve with the first address found (if any).
                logs.info(`Resolved ${containerName} IP addresses: ${addresses}`);
                resolve(addresses.length > 0 ? addresses[0] : null);
            }
        });
    });
}