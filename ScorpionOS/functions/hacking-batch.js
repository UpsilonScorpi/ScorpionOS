/**
 * Hack manager
 * @param {NS} ns
 */
import { scanAll, gainAccess, checkBackdoors } from "../tools/utils.js";

export async function main(ns) {
  ns.disableLog("ALL");
  let target = null;
  let hackWait = 0;
  let growWait = 0;
  let weakenHackWait = 0;
  let weakenGrowWait = 0;

  let hackThread = 0;
  let growThread = 0;
  let weakenHackThread = 0;
  let weakenGrowThread = 0;

  const cooldown = 200;
  const sleepTime = 500;
  const hackAmount = 0.1;

  const weakenScript = "ScorpionOS/workers/weaken.js";
  const growScript = "ScorpionOS/workers/grow.js";
  const hackScript = "ScorpionOS/workers/hack.js";

  while (true) {
    manageServer(ns);
    const servers = scanAll(ns);
    gainAccess(ns, servers);
    const list = checkBackdoors(ns, servers);
    for (const server of list) {
      ns.toast("🔑 Backdoors possibles :" + server, "warning", 5000);
    }
    const workers = listWorker(ns, servers);
    const targetNew = bestTarget(ns, servers);
    if (targetNew !== target) {
      const minSec = ns.getServerMinSecurityLevel(targetNew);
      const maxMoney = ns.getServerMaxMoney(targetNew);
      while (ns.getServerMoneyAvailable(targetNew) < maxMoney * 0.99 || ns.getServerSecurityLevel(targetNew) > minSec + 0.1) {
        await prep(ns, {
          target: targetNew,
          workers,
          minSec,
          maxMoney,
          cooldown
        });
      }
      const hackPercent = ns.hackAnalyze(targetNew);
      hackThread = Math.ceil(hackAmount / hackPercent);

      const secHack = ns.hackAnalyzeSecurity(hackThread);
      weakenHackThread = Math.ceil(secHack / ns.weakenAnalyze(1));

      const growRatio = 1 / (1 - hackAmount * 1.1);
      growThread = Math.ceil(ns.growthAnalyze(targetNew, growRatio));

      const secGrow = ns.growthAnalyzeSecurity(growThread);
      weakenGrowThread = Math.ceil(secGrow / ns.weakenAnalyze(1));

      const tH = ns.getHackTime(targetNew);
      const tG = ns.getGrowTime(targetNew);
      const tW = ns.getWeakenTime(targetNew);

      hackWait = tW - cooldown - tH;
      weakenHackWait = 0;
      growWait = tW - tG + cooldown;
      weakenGrowWait = 2 * cooldown;

      target = targetNew;
    }
    await ns.sleep(cooldown);
    deployWorkers(ns, {
      target,
      script: hackScript,
      thread: hackThread,
      workers,
      delay: hackWait
    });
    deployWorkers(ns, {
      target,
      script: weakenScript,
      thread: weakenHackThread,
      workers,
      delay: weakenHackWait
    });
    deployWorkers(ns, {
      target,
      script: growScript,
      thread: growThread,
      workers,
      delay: growWait
    });
    deployWorkers(ns, {
      target,
      script: weakenScript,
      thread: weakenGrowThread,
      workers,
      delay: weakenGrowWait
    });
    await ns.sleep(sleepTime);
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
 * Calculate the score of a target
 */
function getScore(ns, s, data) {
  const { maxMoney, playerHackLevel, hackMult, reqHackLevel, player } = data;

  const hasFormulas = ns.fileExists("Formulas.exe", "home");
  if (!hasFormulas) {
    const weakenTime = ns.getWeakenTime(s);

    const minSec = ns.getServerMinSecurityLevel(s);

    const hackChance = Math.min(1, Math.max(0, (playerHackLevel / (playerHackLevel + reqHackLevel * minSec)) * hackMult.chance));
    const hackPercent = Math.min(1, Math.max(0, (0.002 * (playerHackLevel / reqHackLevel)) / minSec));

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
    const weakenTime = ns.formulas.hacking.weakenTime(sim, player);

    if (hackChance <= 0 || hackPercent <= 0) return 0;

    const score = (maxMoney * hackPercent * hackChance) / weakenTime;

    return score;
  }
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

  let weakest = null;
  let weakestRam = 0;
  for (const s of pservs) {
    if (ns.getServerMaxRam(s) < weakestRam && ns.ps(s).length === 0) {
      weakest = s;
      weakestRam = ns.getServerMaxRam(s);
    }
  }

  if (weakestRam < ram && weakest !== null) {
    ns.killall(weakest);
    if (ns.deleteServer(weakest)) {
      name = weakest;
      ns.purchaseServer(weakest, ram);
    }
  }
}

/**
 * Function to prepare targeted server
 */
async function prep(ns, data) {
  const { target, workers, minSec, maxMoney, cooldown } = data;

  const currentSec = ns.getServerSecurityLevel(target);
  const secToRemove = currentSec - minSec;
  const weakenThread1 = Math.ceil(secToRemove / ns.weakenAnalyze(1));

  const currentMoney = ns.getServerMoneyAvailable(target);
  const growRatio = maxMoney / Math.max(currentMoney, 1);
  const growThread = Math.ceil(ns.growthAnalyze(target, growRatio));

  const secGrow = ns.growthAnalyzeSecurity(growThread);
  const weakenThread2 = Math.ceil(secGrow / ns.weakenAnalyze(1));

  const tW = ns.getWeakenTime(target);
  const tG = ns.getGrowTime(target);

  const launchW1 = 0;
  const launchG = tW - tG + cooldown;
  const launchW2 = 2 * cooldown;

  const weakenScript = "ScorpionOS/workers/weaken.js";
  const growScript = "ScorpionOS/workers/grow.js";

  if (weakenThread1 > 0) deployWorkers(ns, {
    target,
    script: weakenScript,
    thread: weakenThread1,
    workers,
    delay: launchW1
  });
  if (growThread > 0) deployWorkers(ns, {
    target,
    script: growScript,
    thread: growThread,
    workers,
    delay: launchG
  });
  if (weakenThread2 > 0) deployWorkers(ns, {
    target,
    script: weakenScript,
    thread: weakenThread2,
    workers,
    delay: launchW2
  });

  await ns.sleep(tW + 2.5 * cooldown);
}

/**
 * Function to deploy worker
 */
function deployWorkers(ns, data) {
  const { target, script, thread, workers, delay } = data;
  let remaining = thread;

  for (const [server, ram] of workers) {
    const free = Math.floor((ram - ns.getServerUsedRam(server)) / ns.getScriptRam(script));
    if (free <= 0) continue;
    const use = Math.min(free, remaining);
    ns.scp(script, server);
    ns.exec(script, server, use, target, delay);
    remaining -= use;
    if (remaining <= 0) break;
  }
}