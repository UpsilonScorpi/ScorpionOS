/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    const doc = eval("document");
    const PANEL_ID = "scorpion-os";

    const old = doc.getElementById(PANEL_ID);
    if (old) old.remove();

    // === PANEL ===
    const panel = doc.createElement("div");
    panel.id = PANEL_ID;
    panel.style = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: rgba(10,10,20,0.95);
        border: 1px solid #444;
        border-radius: 8px;
        padding: 0;
        color: #ddd;
        font-family: monospace;
        font-size: 12px;
        max-height: 90vh;
        overflow: hidden;
        min-width: 900px;
        box-shadow: 0 0 10px #000;
    `;
    doc.body.appendChild(panel);

    // === HEADER ===
    const header = doc.createElement("div");
    header.style = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #111;
        padding: 6px 8px;
        border-bottom: 1px solid #333;
        cursor: move;
    `;

    const title = doc.createElement("span");
    title.style = "color:#7fd1ff; font-weight:bold;";
    title.innerHTML = `
        <img src="https://raw.githubusercontent.com/UpsilonScorpi/ScorpionOS/main/img/scorpion.png"
             style="height:18px; vertical-align:middle; margin-right:6px;">
        Scorpion OS
    `;
    header.appendChild(title);

    panel.appendChild(header);

    // === BUTTONS ===
    const btnContainer = doc.createElement("div");

    const toggleBtn = doc.createElement("span");
    toggleBtn.textContent = "🔽";
    toggleBtn.style = "cursor:pointer; margin-right:8px;";
    btnContainer.appendChild(toggleBtn);

    const closeBtn = doc.createElement("span");
    closeBtn.textContent = "❌";
    closeBtn.style = "cursor:pointer;";
    btnContainer.appendChild(closeBtn);

    header.appendChild(btnContainer);

    // === CONTENT (3 modules) ===
    const content = doc.createElement("div");
    content.style = `
        display: flex;
        flex-direction: row;
        gap: 10px;
        padding: 8px;
        max-height: 80vh;
        overflow: auto;
    `;
    panel.appendChild(content);

    // === MODULES 1 : CONTROL PAD ===
    const col1 = doc.createElement("div");
    col1.style = `
        flex: 1;
        line-height: 1.2;
    `;
    col1.innerHTML = `
        <h3 style="color:#7fd1ff; margin:0; padding:0;">Control Pad</h3>
        <h4 style="color:#7fd1ff; margin:0; padding:0;">UI</h4>

        <button id="btn-mod2" style="
            background:#222; border:1px solid #555; color:#7fd1ff;
            padding:4px 8px; margin:0; cursor:pointer; width:100%;
        ">
            <span id="icon-mod2">🟢</span> Server table
        </button>

        <button id="btn-mod3" style="
            background:#222; border:1px solid #555; color:#7fd1ff;
            padding:4px 8px; margin:0; cursor:pointer; width:100%;
        ">
            <span id="icon-mod3">🟢</span> Network tree
        </button>

        <button id="btn-mod4" style="
            background:#222; border:1px solid #555; color:#7fd1ff;
            padding:4px 8px; margin:0; cursor:pointer; width:100%;
        ">
            <span id="icon-mod4">🟢</span> Guide
        </button>

        <h4 style="color:#7fd1ff; margin:0; padding:0;">Script</h4>
        <p>Work in progress…</p>
    `;

    // === MODULE 2 : SERVERS LIST ===
    const col2 = doc.createElement("div");
    col2.style = `
        flex: 1;
        line-height: 1.2;
        border-left: 1px solid #333;
        padding-left: 10px;
    `;
    col2.innerHTML = `
        <p>Work in progress…</p>
    `;

    // === MODULE 3 : NETWORK MAP ===
    const col3 = doc.createElement("div");
    col3.style = `
        flex: 1;
        white-space: pre;
        line-height: 1.2;
        border-left: 1px solid #333;
        padding-left: 10px;
    `;

    // === MODULE 4 : GUIDE ===
    const col4 = doc.createElement("div");
    col4.style = `
        flex: 1;
        line-height: 1.2;
        border-left: 1px solid #333;
        padding-left: 10px;
    `;
    col4.innerHTML = `
        <h3 style="color:#7fd1ff; margin:0; padding:0;">Guide</h3>
        <p>Work in progress…</p>
    `;

    content.appendChild(col1);
    content.appendChild(col2);
    content.appendChild(col3);
    content.appendChild(col4);

    let showModule2 = true;
    let showModule3 = true;
    let showModule4 = true;

    doc.getElementById("btn-mod2").onclick = () => {
        showModule2 = !showModule2;
        col2.style.display = showModule2 ? "block" : "none";
        doc.getElementById("icon-mod2").textContent = showModule2 ? "🟢" : "🔴";
    };

    doc.getElementById("btn-mod3").onclick = () => {
        showModule3 = !showModule3;
        col3.style.display = showModule3 ? "block" : "none";
        doc.getElementById("icon-mod3").textContent = showModule3 ? "🟢" : "🔴";
    };

    doc.getElementById("btn-mod4").onclick = () => {
        showModule4 = !showModule4;
        col4.style.display = showModule4 ? "block" : "none";
        doc.getElementById("icon-mod4").textContent = showModule4 ? "🟢" : "🔴";
    };

    // === COLLAPSE ===
    let collapsed = false;

    toggleBtn.onclick = () => {
        collapsed = !collapsed;
        content.style.display = collapsed ? "none" : "flex";
        toggleBtn.textContent = collapsed ? "🔼" : "🔽";
    };

    closeBtn.onclick = () => panel.remove();

    // === DRAGGABLE ===
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.onmousedown = (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
    };

    doc.onmouseup = () => isDragging = false;

    doc.onmousemove = (e) => {
        if (!isDragging) return;
        panel.style.left = (e.clientX - offsetX) + "px";
        panel.style.top = (e.clientY - offsetY) + "px";
        panel.style.right = "auto";
    };

    // === NETWORK MAP FUNCTIONS ===
    function buildTree() {
        const visited = new Set();
        let lines = [];

        function iconRoot(server) {
            return ns.hasRootAccess(server) ? "🟢" : "🔴";
        }

        function iconBackdoor(server) {
            return ns.getServer(server).backdoorInstalled ? "🔓" : "🔒";
        }

        function dfs(server, depth = 0, prefixState = []) {
            visited.add(server);

            // Préfixe visuel
            if (depth > 0) {
                let prefix = "";
                for (let i = 0; i < depth - 1; i++) {
                    prefix += prefixState[i] ? "   " : "│  ";
                }
                prefix += prefixState[depth - 1] ? "└─ " : "├─ ";

                lines.push(
                    `<span style="color:#0ff;">${prefix}</span>` +
                    `<span style="color:#ff0;">${server}</span> ` +
                    `<span style="color:#0ff;">[${iconRoot(server)}|${iconBackdoor(server)}]</span>`
                );
            } else {
                // Racine
                lines.push(
                    `<span style="color:#ff0;">${server}</span> ` +
                    `<span style="color:#0ff;">[${iconRoot(server)}|${iconBackdoor(server)}]</span>`
                );
            }

            // Enfants
            const neighbors = ns.scan(server).filter(s => !visited.has(s));

            neighbors.forEach((n, i) => {
                const isLast = i === neighbors.length - 1;
                dfs(n, depth + 1, [...prefixState, isLast]);
            });
        }

        dfs("home");
        return lines.join("\n");
        }

    // === MAIN LOOP ===
    while (true) {
        if (!collapsed) {
            col3.innerHTML = `${buildTree()}`;
        }
        await ns.sleep(1500);
    }
}