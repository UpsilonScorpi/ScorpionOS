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
        font-size: 11px;
        max-height: 90vh;
        overflow: hidden;
        min-width: 500px;
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
    title.textContent = "🦂 Scorpion OS";
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

    // === CONTENT ===
    const content = doc.createElement("div");
    content.style = `
        padding: 20px;
        max-height: 80vh;
        overflow: auto;
        text-align: center;
        font-size: 14px;
    `;
    content.innerHTML = `
        <h2 style="color:#7fd1ff;">Work in progress…</h2>
        <p style="opacity:0.8;">Les modules Scorpion OS arrivent bientôt.</p>
    `;
    panel.appendChild(content);

    // === COLLAPSE ===
    let collapsed = false;

    toggleBtn.onclick = () => {
        collapsed = !collapsed;
        content.style.display = collapsed ? "none" : "block";
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

    // === MAIN LOOP ===
    while (true) {
        await ns.sleep(1500);
    }
}