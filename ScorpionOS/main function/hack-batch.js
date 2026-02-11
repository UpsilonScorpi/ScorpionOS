/** Work in progress */
/** @param {NS} ns */
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

/* --------------------------------------------------
    BUY / UPGRADE SERVERS
-------------------------------------------------- */
function manageServers(ns) {
  const pservs = ns.getPurchasedServers();
  const maxServers = ns.getPurchasedServerLimit();
  const maxRam = ns.getPurchasedServerMaxRam();
  const playerMoney = ns.getServerMoneyAvailable("home");
  const prefix = "pserv-";

  let ram = 1;
  while (ram * 2 <= maxRam && ns.getPurchasedServerCost(ram * 2) < playerMoney) {
    ram *= 2;
  }

  if (ram === 1) return;

  let name = "";

  if (pservs.length < maxServers) {
    name = prefix + pservs.length;
    ns.purchaseServer(name, ram);
    return;
  }

  let weakest = pservs[0];
  for (const s of pservs) {
    if (ns.getServerMaxRam(s) < ns.getServerMaxRam(weakest)) weakest = s;
  }

  if (ns.getServerMaxRam(weakest) < ram) {
    ns.killall(weakest);
    if (ns.deleteServer(weakest)) {
      name = weakest;
      ns.purchaseServer(weakest, ram);
    }
  }
}