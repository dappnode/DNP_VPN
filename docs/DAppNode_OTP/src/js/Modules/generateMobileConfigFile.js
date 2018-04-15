// Module generateMobileConfigFile
import generateTagsFromCredentials from './generateTagsFromCredentials';
import FileSaver from 'file-saver';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

let mobileConfigFile =
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>IPSec</key>
			<dict>
				<key>AuthenticationMethod</key>
				<string>SharedSecret</string>
				<key>LocalIdentifierType</key>
				<string>KeyID</string>
				<key>SharedSecret</key>
				<data>
				bXRLZFVxYm1QWEQzSnFmaQ==
				</data>
			</dict>
			<key>IPv4</key>
			<dict>
				<key>OverridePrimary</key>
				<integer>1</integer>
			</dict>
			<key>PPP</key>
			<dict>
				<key>AuthName</key>
				<string>dps_vpn_user</string>
				<key>AuthPassword</key>
				<string>FgR5ZVBF7UsXrJ9a</string>
				<key>CommRemoteAddress</key>
				<string>83.53.16.243</string>
			</dict>
			<key>PayloadDescription</key>
			<string>Configura los ajustes de VPN</string>
			<key>PayloadDisplayName</key>
			<string>VPN</string>
			<key>PayloadIdentifier</key>
			<string>com.apple.vpn.managed.8A014553-C168-4467-AF1F-B43E8DAE2658</string>
			<key>PayloadType</key>
			<string>com.apple.vpn.managed</string>
			<key>PayloadUUID</key>
			<string>8A014553-C168-4467-AF1F-B43E8DAE2658</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Proxies</key>
			<dict>
				<key>HTTPEnable</key>
				<integer>0</integer>
				<key>HTTPSEnable</key>
				<integer>0</integer>
			</dict>
			<key>UserDefinedName</key>
			<string>VPN</string>
			<key>VPNType</key>
			<string>L2TP</string>
		</dict>
	</array>
	<key>PayloadDisplayName</key>
	<string>VPN</string>
	<key>PayloadIdentifier</key>
	<string>MacBook-Pro-de-Eduardo.118D3145-B90E-473B-9371-2739041E4B1B</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>326CEF4C-9520-4A33-91FA-EE78F6C3D265</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`;

export default function(credentials) {
  let credentialTags = generateTagsFromCredentials(credentials);
  /* {
  "server": "127.0.0.1",
  "name": dappnode-giveth,
  "user": "vpn_user",
  "pass": "MC4xO2VkdTtwYXNz",
  "psk": "TI3LjAuMC4x"} */

  for (let tag in credentialTags) {
    mobileConfigFile = mobileConfigFile.replaceAll(tag, credentialTags[tag]);
  }

  var blob = new Blob([mobileConfigFile], {type: "text/plain;charset=utf-8"});
  window.downloadMobileConfig = function() {
    FileSaver.saveAs(blob, "test.mobileconfig");
    console.log('Downloaded config file')
  }

}
