/**
 * Hack manager
 * @param {NS} ns
 */
import { scanAll, gainAccess, checkBackdoors } from "../tools/utils.js";

export async function main(ns) {
  ns.disableLog("ALL");

  while (true) {
    const servers = scanAll(ns);
    gainAccess(ns, servers);
    const list = checkBackdoors(ns, servers);
    for (const server of list) {
      ns.toast("🔑 Backdoors possibles :" + server, "warning", 5000);
    }
    const target = bestTarget(ns, servers);
  }
}

/**
 * Get best target
 */
function bestTarget(ns, servers) {
  let best = null;
  let bestScore = 0;
  const pserv = ns.getPurchasedServers();
  const playerHackLevel = ns.getHackingLevel();
  const hackMult = ns.getHackingMultipliers();
  const player = ns.getPlayer();
  for (const s of servers) {
    if (s === "home") continue;
    if (pserv.includes(s)) continue;
    if (!ns.hasRootAccess(s)) continue;

    const reqHackLevel = ns.getServerRequiredHackingLevel(s);
    if (reqHackLevel > playerHackLevel) continue;

    const maxMoney = ns.getServerMaxMoney(s);
    if (maxMoney <= 0) continue;

    const score = getScore(ns, s, {
      maxMoney,
      playerHackLevel,
      hackMult,
      reqHackLevel,
      player
    });

    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Get all workers
 */
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



/**
 * Buy / Upgrade private server
 */
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

/**
 * Calculate the score of a target
 */
function getScore(ns, s, data) {
  const { maxMoney, playerHackLevel, hackMult, reqHackLevel, player } = data;

  const hasFormulas = ns.fileExists("Formulas.exe", "home");
  if (!hasFormulas) {
    const weakenTime = ns.getWeakenTime(s);

    const minSec = ns.getServerMinSecurityLevel(s);

    const hackChance = Math.min(1,Math.max(0,(playerHackLevel / (playerHackLevel + reqHackLevel * minSec)) * hackMult.chance));
    const hackPercent = Math.min(1,Math.max(0,(0.002 * (playerHackLevel/reqHackLevel)) / minSec));

    if (hackChance <= 0 || hackPercent <= 0) return 0;

    const score = (maxMoney * hackPercent * hackMult.money * hackChance) / weakenTime;

    return score;
  }
  else {
    const sim = ns.getServer(s);
    sim.hackDifficulty = sim.minDifficulty;
    sim.moneyAvailable = sim.moneyMax;
    const hackChance = ns.formulas.hacking.hackChance(sim, player);
    const hackPercent = ns.formulas.hacking.hackPercent(sim, player);
    const weakenTime = ns.formulas.hacking.weakenTime(setTimeout,player);

    if (hackChance <= 0 || hackPercent <= 0) return 0;

    const score = (maxMoney * hackPercent * hackChance) / weakenTime;

    return score;
  }
}