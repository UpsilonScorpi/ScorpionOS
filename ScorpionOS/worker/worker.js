/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const minSec = ns.getServerMinSecurityLevel(target);
    const maxMoney = ns.getServerMaxMoney(target);

    while (true) {
        const curSec = ns.getServerSecurityLevel(target);
        const curMoney = ns.getServerMoneyAvailable(target);

        if (curSec > minSec) {
            await ns.weaken(target);
        } else if (curMoney < maxMoney) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}