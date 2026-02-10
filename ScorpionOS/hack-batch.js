/** Work in progress */
/** @param {NS} ns */
/* --------------------------------------------------
    SCAN ALL NETWORK
-------------------------------------------------- */
export function scan(ns) {
  const servers = [];
  function explore(server) {
    servers.push(server);
    for (const neighbor of ns.scan(server)) if (!servers.includes(neighbor)) explore(neighbor);
  }
  explore("home");
  return servers;
}

/* --------------------------------------------------
    GAIN ROOT ACCESS
-------------------------------------------------- */
export function gainAccess(ns, servers) {
  for (const server of servers) {
    if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(server);
    if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(server);
    if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(server);
    if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(server);
    if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(server);
    if (ns.hasRootAccess(server)) continue;
    if (ns.getServerNumPortsRequired(server) <= ns.getServer(server).openPortCount) ns.nuke(server);
  }
}