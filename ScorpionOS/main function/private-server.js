/** @param {NS} ns */
export async function main(ns) {
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

    await ns.sleep(1500);
  }
}