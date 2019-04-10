const shell = require("./shell");

/**
 * [TODO]
 * Improvement proposal: Don't require the VPN container to exist. Query the image list directly
 * However any command will be launched from the VPN container, so it must exist
 * root@DAppNode:/usr/src/dappnode/DNCORE# docker images --filter=reference='vpn.dnp.dappnode.eth*' --format "{{.Repository}}:{{.Tag}}"
 * vpn.dnp.dappnode.eth:0.1.19
 * vpn.dnp.dappnode.eth:0.1.21
 */

async function getVpnImage() {
  try {
    // the "image" output may contain a newline character. To avoid the next command to fail, trim image
    return await shell(
      `docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}'`,
      { trim: true }
    );
  } catch (e) {
    // Extending the error message preserves the original stack while adding info
    e.message = `Error getting VPN image: ${e.message}`;
    throw e;
  }
}

module.exports = getVpnImage;
