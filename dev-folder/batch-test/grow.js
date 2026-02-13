/** @param {NS} ns **/
export async function main(ns) {
  const target = ns.args[0];
  const delay = ns.args[1] ?? 0;
  const id = ns.args[2];
  ns.tprint(`G : t = ${target} ; d = ${delay} ; ${Date.now()} ; ${id}`);
  await ns.sleep(delay);
  ns.tprint(`S-G : t = ${target} ; d = ${delay} ; ${Date.now()} ; ${id}`);
  await ns.grow(target);
  ns.tprint(`F-G : t = ${target} ; d = ${delay} ; ${Date.now()} ; ${id}`);
}