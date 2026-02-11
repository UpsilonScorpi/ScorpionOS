/**
 * Script to auto solve contract (.cct)
 * @param {NS} ns
 */
import { SOLVERS } from "../tools/solvers";
import { scanAll } from "../tools/utils";

export async function main(ns) {
  ns.disableLog("ALL");
  const servers = scanAll(ns);

  while (true) {
    for (const host of servers) {
      const files = ns.ls(host, ".cct");

      for (const file of files) {
        const type = ns.codingcontract.getContractType(file, host);
        const solver = SOLVERS[type];

        if (!solver) {
          ns.toast(`❔ Pas de solveur pour : ${type} (${file} sur ${host})`,"info",10000);
          continue;
        }

        const data = ns.codingcontract.getData(file, host);

        try {
          const answer = solver(data);
          const success = ns.codingcontract.attempt(answer, file, host);

          if (!success) ns.toast(`⚠️ Mauvaise réponse pour ${type} (${file} sur ${host})`,"warning",10000)
        } catch (e) {
          ns.toast(`❌ Erreur solveur ${type} : ${e}`, "error",10000);
        }
      }
    }
    await ns.sleep(60000);
  }
}