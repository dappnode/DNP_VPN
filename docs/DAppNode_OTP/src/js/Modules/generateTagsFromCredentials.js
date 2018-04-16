export default function (credentials) {
  return {
    "_VPN_SERVER_": credentials.server,
    "_VPN_NAME_": credentials.name,
    "_VPN_USER_": credentials.user,
    "_VPN_PASS_": credentials.pass,
    "_VPN_PSK_": Base64.encode(credentials.psk)
  }
}
