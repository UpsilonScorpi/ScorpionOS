/** Work in progress */
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  while (true) {
    const servers = scan(ns);
    gainAccess(ns, servers);
    const list = checkBackdoors(ns, servers);
    for (const server of list) {
      ns.toast("🔑 Backdoors possibles :" + server, "warning", 1500);
    }
    const listTargets = listTarget(ns, servers);
    const listWorkers = listWorker(ns, servers);
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
    GET ALL TARGETS
-------------------------------------------------- */
function listTarget(ns, servers) {
  let targetList = [];
  for (const s of servers) {
    if (s === "home") continue;
    if (ns.getPurchasedServers().includes(s)) continue;
    if (!ns.hasRootAccess(s)) continue;

    const reqHackLevel = ns.getServerRequiredHackingLevel(s);
    if (reqHackLevel > ns.getHackingLevel()) continue;

    const maxMoney = ns.getServerMaxMoney(s);
    if (maxMoney === 0) continue;

    targetList.push([s, maxMoney]);
  }
  targetList.sort((a, b) => b[1] - a[1])
  return targetList;
}

/* --------------------------------------------------
    GET ALL WORKERS
-------------------------------------------------- */
function listWorker(ns, servers) {
  let workerList = [];
  for (const s of servers) {
    if (s === "home") continue;
    if (!ns.hasRootAccess(s)) continue;

    const ram = ns.getServerMaxRam(s);

    if (ram < 2) continue;

    workerList.push([s, ram]);
  }
  workerList.sort((a, b) => b[1] - a[1])
  return workerList;
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
    BUY / UPGRADE SERVER
-------------------------------------------------- */
function manageServer(ns) {
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