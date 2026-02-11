/** @param {NS} ns **/
export async function main(ns) {
  const base = "https://raw.githubusercontent.com/UpsilonScorpi/ScorpionOS/main/ScorpionOS/";

  const files = [
    // Racine
    "ScoOS.js",

    // functions/
    "functions/contract.js",
    "functions/hacking-temp.js",
    "functions/hacknet.js",

    // tools/
    "tools/solvers.js",
    "tools/utils.js",

    // worker/
    "workers/worker.js"
  ];

  for (const file of files) {
    const url = base + file;
    const local = "ScorpionOS/" + file;

    // Crée les dossiers si besoin
    const parts = local.split("/");
    parts.pop();
    let path = "";
    for (const p of parts) {
      path += p + "/";
      try { ns.mkdir(path); } catch { }
    }

    ns.tprint(`⬇️ Downloading ${file}...`);
    const ok = await ns.wget(url, local);

    if (ok) ns.tprint(`✔️ Updated: ${local}`);
    else ns.tprint(`❌ Failed: ${local}`);
  }

  ns.tprint("🎉 ScorpionOS updated successfully!");
}