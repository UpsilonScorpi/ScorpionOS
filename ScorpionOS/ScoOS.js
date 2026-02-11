/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    const doc = eval("document");
    const PANEL_ID = "scorpion-os";

    const old = doc.getElementById(PANEL_ID);
    if (old) old.remove();

    let actionQueue = [];

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
        <h4 style="color:#7fd1ff; margin-bottom:2px; margin-top:2px; padding:0;">UI</h4>

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

        <h4 style="color:#7fd1ff; margin-bottom:2px; margin-top:2px; padding:0;">Script</h4>

        <button id="btn-scr1" style="
            background:#222; border:1px solid #555; color:#7fd1ff;
            padding:4px 8px; margin:0; cursor:pointer; width:100%;
        ">
            <span id="icon-scr1">🔴</span> Contract
        </button>

        <button id="btn-scr2" style="
            background:#222; border:1px solid #555; color:#7fd1ff;
            padding:4px 8px; margin:0; cursor:pointer; width:100%;
        ">
            <span id="icon-scr2">🔴</span> Hacknet
        </button>

        <button id="btn-scr3" style="
            background:#222; border:1px solid #555; color:#7fd1ff;
            padding:4px 8px; margin:0; cursor:pointer; width:100%;
        ">
            <span id="icon-scr3">🔴</span> Hacking
        </button>
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
        <div id="server-table" style="font-size:11px; margin-top:4px;"></div>
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

    let runScript1 = false;
    let runScript2 = false;
    let runScript3 = false;

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

    doc.getElementById("btn-scr1").onclick = () => {
        runScript1 = !runScript1;

        actionQueue.push({
            type: "toggle-contract-solver",
            enable: runScript1
        });

        doc.getElementById("icon-scr1").textContent = runScript1 ? "🟢" : "🔴";
    };

    doc.getElementById("btn-scr2").onclick = () => {
        runScript2 = !runScript2;

        actionQueue.push({
            type: "toggle-hacknet-opt",
            enable: runScript2
        });

        doc.getElementById("icon-scr2").textContent = runScript2 ? "🟢" : "🔴";
    };

    doc.getElementById("btn-scr3").onclick = () => {
        runScript3 = !runScript3;

        actionQueue.push({
            type: "toggle-hacking",
            enable: runScript3
        });

        doc.getElementById("icon-scr3").textContent = runScript3 ? "🟢" : "🔴";
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
        const pservList = ns.getPurchasedServers();

        function iconRoot(server) {
            return ns.hasRootAccess(server) ? "🟢" : "🔴";
        }

        function iconBackdoor(server) {
            return ns.getServer(server).backdoorInstalled ? "🔓" : "🔒";
        }

        function dfs(server, depth = 0, prefixState = []) {
            visited.add(server);

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
                lines.push(
                    `<span style="color:#ff0;">${server}</span> ` +
                    `<span style="color:#0ff;">[${iconRoot(server)}|${iconBackdoor(server)}]</span>`
                );
            }

            const neighbors = ns.scan(server).filter(s => !visited.has(s)).filter(s => !pservList.includes(s));;

            neighbors.forEach((n, i) => {
                const isLast = i === neighbors.length - 1;
                dfs(n, depth + 1, [...prefixState, isLast]);
            });
        }

        dfs("home");
        return lines.join("\n");
    }

    // === SERVER TABLE FUNCTIONS ===
    function renderServerTable() {
        const pservList = ns.getPurchasedServers();
        const container = doc.getElementById("server-table");
        if (!container) return;

        let servers = ns.scan("home")
            .flatMap(s => getAllServers(s))
            .filter((v, i, a) => a.indexOf(v) === i)
            .filter(s => ns.hasRootAccess(s))
            .filter(s => ns.getServerMaxRam(s) > 0)
            .filter(s => ns.ps(s).length > 0);

        servers = servers.sort((a, b) => {
            if (a === "home") return -1;
            if (b === "home") return 1;
            const aPriv = pservList.includes(a);
            const bPriv = pservList.includes(b);
            if (aPriv && !bPriv) return 1;
            if (!aPriv && bPriv) return -1;
            return a.localeCompare(b);
        });

        function getAllServers(start) {
            const visited = new Set([start]);
            const stack = [start];
            while (stack.length) {
                const host = stack.pop();
                for (const n of ns.scan(host)) {
                    if (!visited.has(n)) {
                        visited.add(n);
                        stack.push(n);
                    }
                }
            }
            return [...visited];
        }

        let html = `
            <table style="border-collapse:collapse; width:100%;">
                <tr>
                    <th style="text-align:left; padding:2px 4px;">Name</th>
                    <th style="text-align:left; padding:2px 4px;">Max RAM</th>
                    <th style="text-align:left; padding:2px 4px;">Used RAM</th>
                    <th style="text-align:left; padding:2px 4px;">Threads</th>
                    <th style="text-align:left; padding:2px 4px;">Scripts</th>
                </tr>
        `;

        for (const s of servers) {
            const max = ns.getServerMaxRam(s);
            const used = ns.getServerUsedRam(s);

            const processes = ns.ps(s);

            const threadsList = processes.length
                ? processes.map(p => `${p.threads}`).join("<br>")
                : "<i>none</i>";

            const scriptList = processes.length
                ? processes.map(p => `${p.filename} [${p.args.join(", ")}]`).join("<br>")
                : "<i>none</i>";

            html += `
                <tr style="border-bottom:1px solid #333;">
                    <td style="padding:2px 4px;">${s}</td>
                    <td style="padding:2px 4px;">${max}</td>
                    <td style="padding:2px 4px;">${used}</td>
                    <td style="padding:2px 4px;">${threadsList}</td>
                    <td style="padding:2px 4px;">${scriptList}</td>
                </tr>
            `;
        }

        html += `</table>`;
        container.innerHTML = html;
    }

    // === MAIN LOOP ===
    while (true) {
        if (!collapsed) {
            if (showModule3) col3.innerHTML = `${buildTree()}`;
            if (showModule2) renderServerTable();
        }

        // Process queued actions
        while (actionQueue.length > 0) {
            const action = actionQueue.shift();

            if (action.type === "toggle-contract-solver") {
                if (action.enable) {
                    ns.exec("contract-solve.js", "home", 1);
                } else {
                    for (const p of ns.ps("home")) {
                        if (p.filename === "contract-solve.js") ns.kill(p.pid);
                    }
                }
            }
            else if (action.type === "toggle-hacknet-opt") {
                if (action.enable) {
                    ns.exec("hacknet-opt.js", "home", 1);
                } else {
                    for (const p of ns.ps("home")) {
                        if (p.filename === "hacknet-opt.js") ns.kill(p.pid);
                    }
                }
            }
            else if (action.type === "toggle-hacking") {
                if (action.enable) {
                    ns.exec("hack-temp.js", "home", 1);
                } else {
                    for (const p of ns.ps("home")) {
                        if (p.filename === "hack-temp.js") ns.kill(p.pid);
                    }
                    while (stack.length > 0) {
                        const server = stack.pop();
                        visited.add(server);
                        for (const n of ns.scan(server)) if (!visited.has(n)) stack.push(n);
                        for (const p of ns.ps(server)) if (p.filename === "worker.js") ns.kill(p.pid);
                    }
                }
            }
        }

        await ns.sleep(1500);
    }
}