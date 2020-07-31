function getServerName(str) {
    if (!str) return "DAppNode_VPN";
    str = decodeURIComponent(str);
    const strLc = str.toLowerCase();
    if (!strLc.includes("dappnode") && !strLc.includes("vpn"))
      return `${str}_DAppNode_VPN`;
    if (!strLc.includes("dappnode") && strLc.includes("vpn"))
      return `${str}_DAppNode`;
    if (strLc.includes("dappnode") && !strLc.includes("vpn"))
      return `${str}_VPN`;
    return str;
}

export default getServerName
