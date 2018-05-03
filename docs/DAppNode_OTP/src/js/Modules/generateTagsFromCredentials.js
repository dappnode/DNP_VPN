import base64url from 'base64url';
import { Base64 } from 'js-base64';

export default function (credentials, forMobileConfig) {

  if (forMobileConfig) {

    return {
      "_VPN_SERVER_": credentials.server,
      "_VPN_NAME_": credentials.name,
      "_VPN_USER_": credentials.user,
      "_VPN_PASS_": credentials.pass,
      "_VPN_PSK_": Base64.encode(credentials.psk),
      "_VPN_OTP_": base64url.encode(JSON.stringify(credentials))
    }

  } else {

    return {
      "_VPN_SERVER_": credentials.server,
      "_VPN_NAME_": credentials.name,
      "_VPN_USER_": credentials.user,
      "_VPN_PASS_": credentials.pass,
      "_VPN_PSK_": credentials.psk,
    }

  }

}
