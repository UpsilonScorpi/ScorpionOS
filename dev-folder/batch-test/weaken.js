/** @param {NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  const delay = ns.args[1] ?? 0;
  const id = ns.args[2];
  ns.tprint(`W : t = ${target} ; d = ${delay} ; ${Date.now()} ; ${id}`);
  await ns.sleep(delay);
  ns.tprint(`S-W : t = ${target} ; d = ${delay} ; ${Date.now()} ; ${id}`);
  await ns.weaken(target);
  ns.tprint(`F-W : t = ${target} ; d = ${delay} ; ${Date.now()} ; ${id}`);
}