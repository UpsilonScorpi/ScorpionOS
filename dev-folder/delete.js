/** @param {NS} ns **/
export async function main(ns) {
  const servers = scanAll(ns);

  for (const host of servers) {
    const files = ns.ls(host, ".js");

    for (const file of files) {
      if (host === ns.getHostname() && (file === ns.getScriptName() || file === "get-os.js")) continue;

      ns.rm(file, host);
      ns.tprint(`🗑️ Supprimé sur ${host} : ${file}`);
    }
  }

  ns.tprint("✔️ Tous les fichiers .js ont été supprimés sur tous les serveurs.");
}

function scanAll(ns) {
  const seen = new Set(["home"]);
  const stack = ["home"];

  while (stack.length) {
    const h = stack.pop();
    for (const n of ns.scan(h)) {
      if (!seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }

  return [...seen];
}