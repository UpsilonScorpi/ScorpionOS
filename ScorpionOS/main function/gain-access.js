/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  while (true) {
    const servers = scan(ns);

    gainAccess(ns, servers);
    const list = checkBackdoors(ns, servers);
    for (const server of list) {
      ns.toast("🔑 Backdoors possibles :" + server, "warning", 5000);
    }
    
    await ns.sleep(1500);
  }
}

/* --------------------------------------------------
    SCAN ALL NETWORK
-------------------------------------------------- */
function scan(ns) {
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
function gainAccess(ns, servers) {
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

/* --------------------------------------------------
    CHECK BACKDOOR AVAILABLE
-------------------------------------------------- */
function checkBackdoors(ns, servers) {
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