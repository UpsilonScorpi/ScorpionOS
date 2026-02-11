/** Work in progress */
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  while (true) {
    const servers = scan(ns);
  }
}

/* --------------------------------------------------
    SCAN ALL NETWORK
-------------------------------------------------- */
function scan(ns) {
  const servers = [];
  function explore(server) {
    servers.push(server);
    for (const neighbor of ns.scan(server)) if (!servers.includes(neighbor)) explore(neighbor);
  }
  explore("home");
  return servers;
}