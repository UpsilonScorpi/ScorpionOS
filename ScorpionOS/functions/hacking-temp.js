/**
 * Hack manager (simple, no batch for now)
 * This is temporary until I made a batch one
 * @param {NS} ns
 */
import { scanAll, gainAccess, checkBackdoors } from "../tools/utils";

export async function main(ns) {
  ns.disableLog("ALL");
  let assignments = [];
  let workers = [];

  while (true) {
    privServManager(ns);
    
    const servers = scanAll(ns);
    gainAccess(ns, servers);

    const list = checkBackdoors(ns, servers);
    for (const server of list) {
      ns.toast("🔑 Backdoors possibles :" + server, "warning", 1500);
    }

    [assignments, workers] = assignTarget(ns, servers);
    for (const w of workers) {
      const worker = w[0];
      const target = assignments.find(a => a[0] === worker)?.[1];
      const processes = ns.ps(worker);
      const running = processes.find(p => p.filename === "worker.js");
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

/**
 * Deploy Workers
 */
function deployWorkers(ns, server, target) {
  const script = "worker.js";
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

/**
 * Assign targets
 */
function assignTarget(ns, servers) {
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

/**
 * Buy / Upgrade private server
 */
function privServManager(ns) {
  ns.disableLog("ALL");

  while (true) {
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
}