/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    while (true) {
        const servers = scanAll(ns);
        for (const host of servers) {
            const files = ns.ls(host, ".cct");
            for (const file of files) {
                const type = ns.codingcontract.getContractType(file, host);
                const solver = SOLVERS[type];
                if (!solver) {
                    ns.tprint(`❌ Pas de solveur pour : ${type} (${file} sur ${host})`);
                    continue;
                }
                const data = ns.codingcontract.getData(file, host);
                try {
                    const answer = solver(data);
                    ns.codingcontract.attempt(answer, file, host);
                } catch (e) {
                    ns.tprint(`❌ Erreur solveur ${type} : ${e}`);
                }
            }
        }
        await ns.sleep(5000);
    }
}

function scanAll(ns) {
    const seen = new Set(["home"]);
    const stack = ["home"];
    while (stack.length) {
        const h = stack.pop();
        for (const n of ns.scan(h)) if (!seen.has(n)) { seen.add(n); stack.push(n); }
    }
    return [...seen];
}

const SOLVERS = {
    "Find Largest Prime Factor": (data) => {
        let fac = 2n;
        let n = BigInt(data);
        while (n >= fac * fac) {
            if (n % fac === 0n) n /= fac;
            else fac = (fac === 2n ? 3n : fac + 2n);
        }
        return n.toString();
    },

    "Subarray with Maximum Sum": (data) => {
        const nums = data.slice();
        for (let i = 1; i < nums.length; i++) nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
        return Math.max(...nums);
    },

    "Total Ways to Sum": (data) => {
        const ways = Array(data + 1).fill(0);
        ways[0] = 1;
        for (let i = 1; i < data; i++) for (let j = i; j <= data; j++) ways[j] += ways[j - i];
        return ways[data];
    },

    "Total Ways to Sum II": (data) => {
        const n = data[0], s = data[1], ways = Array(n + 1).fill(0);
        ways[0] = 1;
        for (const c of s) for (let j = c; j <= n; j++) ways[j] += ways[j - c];
        return ways[n];
    },

    "Spiralize Matrix": (data) => {
        const spiral = [];
        let u = 0, d = data.length - 1, l = 0, r = data[0].length - 1;
        while (u <= d && l <= r) {
            for (let col = l; col <= r; col++) spiral.push(data[u][col]);
            u++;
            for (let row = u; row <= d; row++) spiral.push(data[row][r]);
            r--;
            if (u <= d) {
                for (let col = r; col >= l; col--) spiral.push(data[d][col]);
                d--;
            }
            if (l <= r) {
                for (let row = d; row >= u; row--) spiral.push(data[row][l]);
                l++;
            }
        }
        return spiral;
    },

    "Array Jumping Game": (data) => {
        let i = 0;
        for (let reach = 0; i < data.length && i <= reach; i++) reach = Math.max(reach, i + data[i]);
        return (i === data.length ? 1 : 0);
    },

    "Array Jumping Game II": (data) => {
        if (data.length < 2 || data[0] === 0) return 0;
        let jumps = 0, end = 0, far = 0;
        for (let i = 0; i < data.length - 1; i++) {
            far = Math.max(far, i + data[i]);
            if (i === end) {
                jumps++;
                end = far;
                if (end >= data.length - 1) return jumps;
            }
        }
        return 0;
    },

    "Merge Overlapping Intervals": (data) => {
        data.sort((a, b) => a[0] - b[0]);
        const merged = [];
        let [start, end] = data[0];
        for (const [s, e] of data) {
            if (s <= end) end = Math.max(end, e);
            else {
                merged.push([start, end]);
                start = s;
                end = e;
            }
        }
        merged.push([start, end]);
        return merged;
    },

    "Generate IP Addresses": (data) => {
        const ips = [];
        const valid = (part) => part.length === 1 || (part[0] !== "0"&& Number(part) <= 255);
        for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) for (let c = 1; c <= 3; c++) for (let d = 1; d <= 3; d++) if (a + b + c + d === data.length) {
            const A = data.slice(0, a), B = data.slice(a, a + b), C = data.slice(a + b, a + b + c), D = data.slice(a + b + c);
            if (valid(A) && valid(B) && valid(C) && valid(D)) ips.push(`${A}.${B}.${C}.${D}`);
        }
        return ips;
    },

    "Algorithmic Stock Trader I": (data) => {
        let maxCur = 0, maxSoFar = 0;
        for (let i = 1; i < data.length; i++) {
            maxCur = Math.max(0, maxCur + data[i] - data[i - 1]);
            maxSoFar = Math.max(maxSoFar, maxCur);
        }
        return maxSoFar;
    },

    "Algorithmic Stock Trader II": (data) => {
        let profit = 0;
        for (let p = 1; p < data.length; p++) profit += Math.max(0, data[p] - data[p - 1]);
        return profit;
    },

    "Algorithmic Stock Trader III": (data) => {
        let hold1 = -Infinity, hold2 = -Infinity, release1 = 0, release2 = 0;
        for (const p of data) {
            release2 = Math.max(release2, hold2 + p);
            hold2 = Math.max(hold2, release1 - p);
            release1 = Math.max(release1, hold1 + p);
            hold1 = Math.max(hold1, -p);
        }
        return release2;
    },

    "Algorithmic Stock Trader IV": (data) => {
        const k = data[0], prices = data[1];
        if (prices.length < 2) return 0;
        if (k >= prices.length / 2) {
            let profit = 0;
            for (let i = 1; i < prices.length; i++) profit += Math.max(0, prices[i] - prices[i - 1]);
            return profit;
        }
        const hold = Array(k + 1).fill(-Infinity);
        const release = Array(k + 1).fill(0);
        for (const p of prices) for (let j = k; j > 0; j--) {
            release[j] = Math.max(release[j], hold[j] + p);
            hold[j] = Math.max(hold[j], release[j - 1] - p);
        }
        return release[k];
    },

    "Minimum Path Sum in a Triangle": (data) => {
        const dp = data[data.length - 1].slice();
        for (let i = data.length - 2; i > -1; i--) for (let j = 0; j < data[i].length; j++) dp[j] = Math.min(dp[j], dp[j+1]) + data[i][j];
        return dp[0];
    },

    "Unique Paths in a Grid I": (data) => {
        const n = data[0], m = data[1];
        const currentRow = Array(n).fill(1);
        for (let row = 1; row < m; row++) for (let i = 1; i < n; i++) currentRow[i] += currentRow[i-1];
        return currentRow[n-1];
    },

    "Unique Paths in a Grid II": (data) => {
        const r = data.length, c = data[0].length;
        const dp = Array(c).fill(0);
        dp[0] = data[0][0] === 0 ? 1 : 0;
        for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
            if (data[i][j] === 1) dp[j] = 0;
            else if (j > 0) dp[j] += dp[j - 1];
        }
        return dp[c - 1];
    },

    "Shortest Path in a Grid": (data) => {
        const h = data.length, w = data[0].length;
        const dirs = [[1,0,"D"], [-1,0,"U"], [0,1,"R"], [0,-1,"L"]];
        const seen = Array.from({ length: h }, () => Array(w).fill(false));
        const parent = Array.from({ length: h }, () => Array(w).fill(null));
        const q = [[0, 0]];
        seen[0][0] = true;
        while (q.length) {
            const [r, c] = q.shift();
            if (r === h - 1 && c === w - 1) break;
            for (const [dr, dc, ch] of dirs) { 
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue;
                if (data[nr][nc] === 1 || seen[nr][nc]) continue;
                seen[nr][nc] = true;
                parent[nr][nc] = [r, c, ch];
                q.push([nr, nc]);
            }
        }
        if (!parent[h - 1][w - 1]) return "";
        const path = [];
        let r = h - 1, c = w - 1;
        while (r !== 0 || c !== 0) {
            const [pr, pc, ch] = parent[r][c];
            path.push(ch);
            r = pr; c = pc;
        }
        return path.reverse().join("");
    },

    "Sanitize Parentheses in Expression": (data) => {
        let left = 0, right = 0;
        for (const ch of data) {
            if (ch === '(') left++;
            else if (ch === ')') left > 0 ? left-- : right++;
        }
        const res = new Set();
        function dfs(i, cur, l, r, bal) {
            if (i === data.length) {
                if (l === 0 && r === 0 && bal === 0) res.add(cur);
                return;
            }
            const ch = data[i];
            if (ch === "(") {
                if (l > 0) dfs(i + 1, cur, l - 1, r, bal);
                dfs(i + 1, cur + ch, l, r, bal + 1);
            } else if (ch === ")") {
                if (r > 0) dfs(i + 1, cur, l, r - 1, bal);
                if (bal > 0) dfs(i + 1, cur + ch, l, r, bal - 1);
            } else dfs(i + 1, cur + ch, l, r, bal);
        }
        dfs(0, "", left, right, 0);
        return [...res];
    },

    "Find All Valid Math Expressions" : (data) => {
        const digits = data[0], target = data[1];
        const res = [];
        function dfs(i, expr, val, last) {
            if (i === digits.length) {
                if (val === target) res.push(expr);
                return;
            }
            for (let j = i + 1; j <= digits.length; j++) {
                const part = digits.slice(i, j);
                if (part.length > 1 && part[0] === "0") break;
                const num = +part;
                if (i === 0) dfs(j, part, num, num);
                else {
                    dfs(j, expr + "+" + part, val + num, num);
                    dfs(j, expr + "-" + part, val - num, -num);
                    dfs(j, expr + "*" + part, val - last + last * num, last * num);
                }
            }
        }
        dfs(0, "", 0, 0);
        return res;
    },

    "HammingCodes: Integer to Encoded Binary" : (data) => {
        data = Number(data);
        const enc = [0];
        const data_bits = data.toString(2).split("").reverse().map(x => Number(x));
        let k = data_bits.length;
        for (let i = 1; k > 0; i++) {
            enc[i] = (i & (i - 1)) != 0 ? data_bits[--k] : 0;
        }
        let parity = 0;
        for (let i = 0; i < enc.length; i++) if (enc[i]) parity ^= i;
        parity = parity.toString(2).split("").reverse().map(x => Number(x));
        for (let i = 0; i < parity.length; i++) enc[2**i] = parity[i] ? 1 : 0;
        parity = 0;
        for (let i = 0; i < enc.length; i++) if (enc[i]) parity++;
        enc[0] = parity % 2 == 0 ? 0 : 1;
        return enc.join("");
    },

    "HammingCodes: Encoded Binary to Integer" : (data) => {
        let err = 0;
        const bits = [];
        for (const i in data.split("")) {
            const bit = Number(data[i]);
            bits[i] = bit;
            if (bit) err ^= +i;
        }
        if (err) bits[err] ^= 1;
        let ans = "";
        for (let i = 1; i < bits.length; i++) if ((i & (i - 1)) != 0) ans += bits[i];
        return parseInt(ans, 2);
    },
    
    "Proper 2-Coloring of a Graph" : (data) => {
        const n = data[0];
        const edges = data[1];
        const adj = Array.from({length : n}, () => []);
        for (const [u,v] of edges) {
            adj[u].push(v);
            adj[v].push(u);
        }
        const color = Array(n).fill(undefined);
        let oddCycle = false;
        const dfs = (u, c) => {
            if (oddCycle) return;
            if (color[u] === c) return;
            if (color[u] === (c ^ 1)) {
                oddCycle = true;
                return;
            }
            color[u] = c;
            for (const v of adj[u]) dfs(v, c ^ 1);
        }
        while(!oddCycle && color.includes(undefined)) dfs(color.indexOf(undefined), 0);
        return oddCycle ? "[]" : color;
    },

    "Compression I: RLE Compression" : (data) => {
        let result = '';
        for (let i = 0; i < data.length;) {
            let run = 1;
            while (i + run < data.length && data[i + run] === data[i]) run++;
            const ch = data[i];
            i += run;
            while (run > 0) {
                const chunk = Math.min(9,run);
                result += String(chunk) + ch;
                run -= chunk;
            }
        }
        return result;
    },

    "Compression II: LZ Decompression" : (data) => {
        let plain = "";
        let i = 0;
        while (i < data.length) {
            const litLen = data.charCodeAt(i) - 0x30;
            if (litLen < 0 || litLen > 9 || i + 1 + litLen > data.length) return null;
            plain += data.slice(i+1, i+1+litLen);
            i+= 1 + litLen
            if (i >= data.length) break;
            const backLen = data.charCodeAt(i) - 0x30;
            if (backLen < 0 || backLen > 9) return null;
            else if (backLen === 0) i++;
            else {
                if (i + 1 >= data.length) return null;
                const backOff = data.charCodeAt(i+1) - 0x30;
                if((backLen > 0 && (backOff < 1 || backOff > 9)) || backOff > plain.length) return null;
                for (let j = 0; j < backLen; j++) plain += plain[plain.length - backOff];
                i += 2;
            }
        }
        return plain;
    },

    "Compression III: LZ Compression" : (data) => {
        let cur = Array.from({length: 10}, () => Array(10).fill(null)), next = Array.from({length: 10}, () => Array(10));
        function set(state, i, j, str) {
            const current = state[i][j];
            if (current == null || str.length < current.length || (str.length === current.length && Math.random() < 0.5)) state[i][j] = str;
        }
        cur[0][1] = "";
        for (let i = 1; i < data.length; i++) {
            for (const row of next) row.fill(null);
            const c = data[i];
            for (let length = 1; length <= 9; length++) {
                const string = cur[0][length];
                if (string == null) continue;
                if (length < 9) set(next, 0, length + 1, string);
                else set(next, 0, 1, string + "9" + data.slice(i-9, i) + "0");
                for (let offset = 1; offset <= Math.min(9,i); offset++) if (data[i - offset] === c) set(next, offset, 1, string + String(length) + data.slice(i - length, i));
            }
            for (let offset = 1; offset <= 9; offset++) for (let length = 1; length <= 9; length++) {
                const string = cur[offset][length];
                if (string == null) continue;
                if (data[i - offset] === c) {
                    if (length < 9) set(next, offset, length + 1, string);
                    else set(next, offset, 1, string + "9" + String(offset) + "0");
                }
                set(next, 0, 1, string + String(length) + String(offset));
                for (let new_offset = 1; new_offset <= Math.min(9,i); new_offset++) if (data[i - new_offset] === c) set(next, new_offset, 1, string + String(length) + String(offset) + "0");
            }
            const tmp_state = cur;
            cur = next;
            next = tmp_state;
        }
        let result = null;
        for (let len = 1; len <= 9; len++) {
            let string = cur[0][len];
            if (string == null) continue;
            string += String(len) + data.slice(data.length - len, data.length);
            if (result == null || string.length < result.length || (string.length == result.length && Math.random() < 0.5)) result = string;
        }
        for (let offset = 1; offset <= 9; offset++) for (let len = 1; len <= 9; len++) {
            let string = cur[offset][len];
            if (string == null) continue;
            string += String(len) + "" + String(offset);
            if (result == null || string.length < result.length || (string.length == result.length && Math.random() < 0.5)) result = string;
        }
        return result ?? "";
    },

    "Encryption I: Caesar Cipher" : (data) => {
        return [...data[0]].map((a) => (a === " " ? a : String.fromCharCode(((a.charCodeAt(0) - 65 - data[1] + 26) % 26) + 65))).join("");
    },

    "Encryption II: Vigenère Cipher" : (data) => {
        return [...data[0]].map((a,i) => (a === " " ? a : String.fromCharCode(((a.charCodeAt(0) - 2 * 65 + data[1].charCodeAt(i % data[1].length)) % 26) + 65))).join("");
    },

    "Square Root": (data) => {
        let x = data
        let y = (x + data / x) / 2n;
        while (y < x) {
            x = y;
            y = (x + data / x) / 2n;
        }
        let t = x * x + x + 1n;
        if (data >= t) x++;
        return x;
    }
};