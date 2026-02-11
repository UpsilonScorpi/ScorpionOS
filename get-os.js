/** @param {NS} ns **/
export async function main(ns) {
  const base = "https://raw.githubusercontent.com/UpsilonScorpi/ScorpionOS/main/ScorpionOS/";

  const files = [
    "ScoOS.js",

    "functions/contract.js",
    "functions/hacking-temp.js",
    "functions/hacknet.js",

    // tools/
    "tools/solvers.js",
    "tools/utils.js",

    "workers/worker.js"
  ];

  ns.tprint("🔄️ ScorpionOS downloading");

  for (const file of files) {
    const url = base + file;
    const local = "ScorpionOS/" + file;

    const parts = local.split("/");
    parts.pop();
    let path = "";
    for (const p of parts) {
      path += p + "/";
      try { ns.mkdir(path); } catch { }
    }
    await ns.wget(url, local);
  }

  ns.tprint("✅ ScorpionOS downloaded");
  ns.tprint("🌐 Launch ScorpionOS: run ScorpionOS/ScoOS.js");
}