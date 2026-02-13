/** @param {NS} ns **/
export async function main(ns) {
  const version = ns.args[0];
  if (!version) {
    ns.tprint("❌ Usage: run download.js <version>");
    return;
  }

  const base = "https://raw.githubusercontent.com/UpsilonScorpi/ScorpionOS/main/ScorpionOS/";
  const versionUrl = `${base}versions/${version}.json`;
  const versionLocal = `ScorpionOS/versions/${version}.json`;

  // Créer le dossier versions/
  try { ns.mkdir("ScorpionOS/versions"); } catch { }

  ns.tprint(`🔄️ Downloading version file: ${versionUrl}`);

  // Télécharger le JSON de version
  const ok = await ns.wget(versionUrl, versionLocal);
  if (!ok) {
    ns.tprint(`❌ Failed to download version file: ${versionUrl}`);
    return;
  }

  // Lire le JSON téléchargé
  const json = ns.read(versionLocal);
  let files;
  try {
    files = JSON.parse(json);
  } catch (e) {
    ns.tprint("❌ Invalid JSON in version file");
    return;
  }

  ns.tprint(`🔄️ ScorpionOS downloading version ${version}`);

  for (const [localName, remotePath] of Object.entries(files)) {
    const url = base + remotePath;

    // On récupère le dossier GitHub
    const parts = remotePath.split("/");
    parts.pop(); // retire le nom du fichier GitHub
    const folder = parts.join("/");

    // Le fichier local doit être dans le même dossier, mais avec un nom différent
    const local = folder
      ? `ScorpionOS/${folder}/${localName}.js`
      : `ScorpionOS/${localName}.js`;

    // Création des dossiers
    const folders = local.split("/");
    folders.pop();
    let path = "";
    for (const f of folders) {
      path += f + "/";
      try { ns.mkdir(path); } catch { }
    }

    await ns.wget(url, local);
    ns.tprint(`📥 ${localName}.js ← ${remotePath}`);
  }

  ns.tprint("✅ ScorpionOS downloaded");
  ns.tprint("🌐 Launch ScorpionOS: run ScorpionOS/ScoOS.js");
}