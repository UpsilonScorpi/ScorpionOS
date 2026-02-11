/**
 * Toolbox for all usefull function
 * @param {NS} ns
 */

/**
 * Function to scan the entire network
 */
export function scanAll(ns) {
  const servers = [];

  function explore(server) {
    servers.push(server);

    for (const neighbor of ns.scan(server)) {
      if (!servers.includes(neighbor)) {
        explore(neighbor);
      }
    }
  }

  explore("home");

  return servers;
}

/**
 * Function to open port and gain root access
 */
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

/**
 * Function to get all available backdoor
 */
export function checkBackdoors(ns, servers) {
  const list = [];
  const pservs = ns.getPurchasedServers();
  const playerHackingLevel = ns.getHackingLevel();

  for (const server of servers) {
    if (server === "home") continue;
    if (pservs.includes(server)) continue;
    if (!ns.hasRootAccess(server)) continue;

    const serverData = ns.getServer(server);

    if (serverData.backdoorInstalled) continue;
    if (playerHackingLevel >= serverData.requiredHackingSkill) list.push(server);
  }

  return list;
}