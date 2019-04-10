const expect = require("chai").expect;
const proxyquire = require("proxyquire");

const vpnImage = "vpn.dnp.dappnode.eth:0.1.21";
const expectedCmd =
  "docker run --rm --net=host vpn.dnp.dappnode.eth:0.1.21 upnpc -l";
const cmdOutput = `upnpc : miniupnpc library test client, version 2.0.
(c) 2005-2017 Thomas Bernard.
Go to http://miniupnp.free.fr/ or https://miniupnp.tuxfamily.org/
for more information.
List of UPNP devices found on the network :
desc: http://192.168.1.1:5431/dyndev/uuid:acbd-acbd-acbd-acbd-0000
st: urn:schemas-upnp-org:device:InternetGatewayDevice:1

Found valid IGD : http://192.168.1.1:5431/uuid:acbd-acbd-acbd-acbd-0000/WANPPPConnection:1
Local LAN ip address : 192.168.1.34
Connection Type : IP_Routed
Status : Connected, uptime=3521439s, LastConnectionError : 
 Time started : Tue Dec 18 11:23:14 2018
MaxBitRateDown : 0 bps   MaxBitRateUp 0 bps
ExternalIPAddress = 85.84.83.82
i protocol exPort->inAddr:inPort description remoteHost leaseTime
0 UDP  1194->192.168.1.34:1194  'DAppNode' '' 0
1 TCP    22->192.168.1.42:22    'DAppNode' '' 0
2 UDP 30303->192.168.1.34:30303 'DAppNode' '' 0
3 TCP 30303->192.168.1.34:30303 'DAppNode' '' 0
4 TCP  4001->192.168.1.34:4001  'DAppNode' '' 0
5 UDP  4002->192.168.1.34:4002  'DAppNode' '' 0
GetGenericPortMappingEntry() returned 713 (SpecifiedArrayIndexInvalid)
`;

describe("Util: getExternalUpnpIp", () => {
  const getExternalUpnpIp = proxyquire("../../src/utils/getExternalUpnpIp", {
    "./shell": async cmd => {
      if (cmd.trim() === expectedCmd.trim()) {
        return cmdOutput;
      } else {
        throw Error(`Unknown cmd: ${cmd}`);
      }
    },
    "./getVpnImage": async () => vpnImage
  });

  it("should get normal otp", async () => {
    const internalIp = await getExternalUpnpIp();
    expect(internalIp).to.equal("85.84.83.82");
  });
});
