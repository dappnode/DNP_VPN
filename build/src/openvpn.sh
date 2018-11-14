# Check if server is initalized and admin profile exists
# init: /etc/openvpn/openvpn.conf && /etc/openvpn/ovpn_env.sh
# check pki and admin user:  

# init steps:
# ovpn_genconfig -u udp://xxxxxxx.dyndns.dappnode.io -s 172.33.10.64/26 -n 172.33.1.2
# EASYRSA_BATCH=yes EASYRSA_REQ_CN=xxxxxx.dyndns.dappnode.io openvpn ovpn_initpki nopass
# openvpn easyrsa build-client-full dappnode_admin nopass


# run ovpn_run.sh