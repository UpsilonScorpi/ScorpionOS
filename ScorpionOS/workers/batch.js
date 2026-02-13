/**
 * Hack manager
 * @param {NS} ns
 */

import { scanAll } from "../tools/utils";

export async function main(ns) {
  ns.disableLog("ALL");
  const target = ns.args[0];
  const cooldown = ns.args[1];
  const sleepTime = ns.args[2];
  const hackAmount = ns.args[3];

  const weakenScript = "ScorpionOS/workers/weaken.js";
  const growScript = "ScorpionOS/workers/grow.js";
  const hackScript = "ScorpionOS/workers/hack.js";

  const minSec = ns.getServerMinSecurityLevel(target);
  const maxMoney = ns.getServerMaxMoney(target);

  while (ns.getServerMoneyAvailable(target) < maxMoney * 0.99 || ns.getServerSecurityLevel(target) > minSec + 0.1) {
    await prep(ns, {
      target: target,
      minSec,
      maxMoney,
      cooldown
    });
  }

  const hackPercent = ns.hackAnalyze(target);
  const hackThread = Math.ceil(hackAmount / hackPercent);

  const secHack = ns.hackAnalyzeSecurity(hackThread);
  const weakenHackThread = Math.ceil(secHack / ns.weakenAnalyze(1) * 1.1);

  const growRatio = (1 + (hackAmount / (1 - hackAmount))) * 1.1;
  const growThread = Math.ceil(ns.growthAnalyze(target, growRatio) * 1.1);

  const secGrow = ns.growthAnalyzeSecurity(growThread);
  const weakenGrowThread = Math.ceil(secGrow / ns.weakenAnalyze(1) * 1.1);

  const tH = ns.getHackTime(target);
  const tG = ns.getGrowTime(target);
  const tW = ns.getWeakenTime(target);

  const hackWait = tW - cooldown - tH;
  const weakenHackWait = 0;
  const growWait = tW - tG + cooldown;
  const weakenGrowWait = 2 * cooldown;

  while (true) {
    while (ns.getServerMoneyAvailable(target) < maxMoney * 0.99 || ns.getServerSecurityLevel(target) > minSec + 0.1) {
      await prep(ns, {
        target: target,
        minSec,
        maxMoney,
        cooldown
      });
    }
    deployWorkers(ns, {
      target,
      script: hackScript,
      thread: hackThread,
      delay: hackWait
    });
    deployWorkers(ns, {
      target,
      script: weakenScript,
      thread: weakenHackThread,
      delay: weakenHackWait
    });
    deployWorkers(ns, {
      target,
      script: growScript,
      thread: growThread,
      delay: growWait
    });
    deployWorkers(ns, {
      target,
      script: weakenScript,
      thread: weakenGrowThread,
      delay: weakenGrowWait
    });
    await ns.sleep(sleepTime);
  }
}

/**
 * Get all workers
 */
function listWorker(ns, servers) {
  let workerList = [];
  for (const s of servers) {
    if (!ns.hasRootAccess(s)) continue;

    let ram = ns.getServerMaxRam(s);
    if (s === "home") ram *= 0.75;

    if (ram < 2) continue;

    workerList.push([s, ram]);
  }
  workerList.sort((a, b) => b[1] - a[1])
  return workerList;
}

/**
 * Function to prepare targeted server
 */
async function prep(ns, data) {
  const { target, minSec, maxMoney, cooldown } = data;

  const currentSec = ns.getServerSecurityLevel(target);
  const secToRemove = currentSec - minSec;
  const weakenThread1 = Math.ceil(secToRemove / ns.weakenAnalyze(1) * 1.1);

  const currentMoney = ns.getServerMoneyAvailable(target);
  const growRatio = maxMoney / Math.max(currentMoney, 1);
  const growThread = Math.ceil(ns.growthAnalyze(target, growRatio) * 1.1);

  const secGrow = ns.growthAnalyzeSecurity(growThread);
  const weakenThread2 = Math.ceil(secGrow / ns.weakenAnalyze(1) * 1.1);

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
    delay: launchW1
  });
  if (growThread > 0) deployWorkers(ns, {
    target,
    script: growScript,
    thread: growThread,
    delay: launchG
  });
  if (weakenThread2 > 0) deployWorkers(ns, {
    target,
    script: weakenScript,
    thread: weakenThread2,
    delay: launchW2
  });

  await ns.sleep(tW + 2.5 * cooldown);
}

/**
 * Function to deploy worker
 */
function deployWorkers(ns, data) {
  const { target, script, thread, delay } = data;
  const workers = listWorker(ns, scanAll(ns));
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