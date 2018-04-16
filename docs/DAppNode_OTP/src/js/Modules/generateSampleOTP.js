import base64url from 'base64url';

window.generateSampleOTP = function() {
  let test = {
  "server": "127.0.0.1",
  "name": "dappnode-giveth",
  "user": "vpn_user",
  "pass": "MC4xO2VkdTtwYXNz",
  "psk": "TI3LjAuMC4x" };
  let otpEncoded = base64url.encode(JSON.stringify(test));
  let url = window.location.href + '#otp=' + otpEncoded;
  console.log(url)
}
