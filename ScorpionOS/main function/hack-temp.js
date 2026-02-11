/** @param {NS} ns */
/* --------------------------------------------------
    SCAN ALL NETWORK
-------------------------------------------------- */
export function scan(ns) {
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

    if (server === "home") continue;
    if (ns.hasRootAccess(server)) continue;
    if (ns.getServerNumPortsRequired(server) <= ns.getServer(server).openPortCount) ns.nuke(server);
  }
}

/* --------------------------------------------------
    CHECK BACKDOOR AVAILABLE
-------------------------------------------------- */
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

/* --------------------------------------------------
    BUY / UPGRADE SERVERS
-------------------------------------------------- */
export function manageServers(ns) {
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

/* --------------------------------------------------
    DEPLOY WORKERS
-------------------------------------------------- */
export function deployWorkers(ns, server, target) {
  const script = "script/worker.js";
  const ramPerThread = ns.getScriptRam(script);

  if (!ns.hasRootAccess(server)) return;

  let freeRam = ns.getServerMaxRam(server);
  if (server === "home") freeRam -= 50;
  if (freeRam < ramPerThread) return;

  const threads = Math.floor(freeRam / ramPerThread);
  if (threads <= 0) return;

  if (server === "home") {
    for (const p of ns.ps("home")) {
      if (p.filename === script) ns.kill(p.pid);
    }
  } else {
    ns.killall(server);
  }
  ns.scp(script, server);
  ns.exec(script, server, threads, target);
}

/* --------------------------------------------------
    ATTRIBUTE TARGET
-------------------------------------------------- */
export function assignTarget(ns, servers) {
  const assignments = [];
  const targets = [];
  const workers = [];

  for (const server of servers) {
    if (!ns.hasRootAccess(server)) continue;

    if (!ns.getPurchasedServers().includes(server) && server !== "home" && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
      const money = ns.getServerMaxMoney(server);
      if (money > 0) {
        const sec = ns.getServerMinSecurityLevel(server);
        const growth = ns.getServerGrowth(server);
        const score = money * growth / (sec + 1);
        targets.push([server, score]);
      }
    }

    if (server === "home") {
      workers.push([server, ns.getServerMaxRam(server) - 50]);
    } else {
      workers.push([server, ns.getServerMaxRam(server)]);
    }
  }

  targets.sort((a, b) => b[1] - a[1]);
  workers.sort((a, b) => b[1] - a[1]);

  for (let i = 0; i < targets.length; i++) {
    const worker = workers[i][0];
    const target = targets[i][0];
    assignments.push([worker, target]);
  }

  return [assignments, workers];
}

/* --------------------------------------------------
    MAIN LOOP
-------------------------------------------------- */
/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  let assignments = [];
  let workers = [];

  while (true) {
    manageServers(ns);

    const servers = scan(ns);

    gainAccess(ns, servers);
    const list = checkBackdoors(ns, servers);
    for (const server of list) {
      ns.toast("🔑 Backdoors possibles :" + server, "warning", 5000);
    }

    [assignments, workers] = assignTarget(ns, servers);
    for (const w of workers) {
      const worker = w[0];
      const target = assignments.find(a => a[0] === worker)?.[1];
      const processes = ns.ps(worker);
      const running = processes.find(p => p.filename === "script/worker.js");
      if (target) {
        if (running && running.args[0] === target) continue;
        deployWorkers(ns, worker, target);
      } else {
        if (running) ns.kill(running.pid);
      }      
    }

    await ns.sleep(5000);
  }
}