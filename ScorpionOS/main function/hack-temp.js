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
    DEPLOY WORKERS
-------------------------------------------------- */
export function deployWorkers(ns, server, target) {
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
    const servers = scan(ns);

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