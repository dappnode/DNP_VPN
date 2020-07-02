import { shell } from "../utils/shell";

export async function buildClient(id: string) {
  try {
    return await shell(`easyrsa build-client-full ${id} nopass`);
  } catch (err) {
    throw Error(`Error building client: ${err.message}`);
  }
}
