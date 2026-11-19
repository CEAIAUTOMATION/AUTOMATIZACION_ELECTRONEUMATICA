// js/compiler.js
export const parse = s => {
    s = s.replace(/\s+/g, '');
    if (!s) return { op: 'val', val: 1 };
    if (/^[01]$/.test(s)) return { op: 'val', val: +s };
    if (/^[A-Za-z_][\w.]*$/.test(s)) return { op: 'var', id: s };
    
    let bal = 0, minP = 10, op = null, pos = -1;
    const prec = { '|': 1, '&': 2, '=': 3, '!=': 3, '>': 3, '<': 3, '>=': 3, '<=': 3 };
    
    for (let i = s.length - 1; i >= 0; i--) {
        const c = s[i];
        if (c === ')') bal++;
        else if (c === '(') bal--;
        else if (bal === 0) {
            let o = c;
            if (i > 0 && ['=', '!', '>', '<'].includes(s[i-1]) && c === '=') { o = s[i-1] + c; i--; }
            if (prec[o] && prec[o] < minP) { minP = prec[o]; op = o; pos = i; }
        }
    }
    
    if (op) {
        return { op, left: parse(s.slice(0, pos)), right: parse(s.slice(pos + op.length)) };
    }
    if (s[0] === '!') return { op: 'not', arg: parse(s.slice(1)) };
    if (s[0] === '(' && s[s.length - 1] === ')') return parse(s.slice(1, -1));
    if (/^\d+$/.test(s)) return { op: 'val', val: +s };
    throw new Error('Sintaxis inválida: ' + s);
};

export const acts = s => {
    return s.split(',').map(x => x.trim()).filter(Boolean).map(x => {
        let m = x.match(/^(S|R|CALL)\s*:\s*([A-Za-z_][\w.]*)$/);
        if (m) return { op: m[1], id: m[2] };
        m = x.match(/^([A-Za-z_][\w.]*)\s*=\s*(.+)$/);
        if (m) return { op: 'assign', id: m[1], expr: parse(m[2]) };
        if (/^[A-Za-z_][\w.]*$/.test(x)) return { op: 'out', id: x };
        return null;
    }).filter(Boolean);
};

export const parseLadder = txt => {
    return txt.split('\n').map(line => {
        line = line.trim();
        if (!line || line.startsWith('//')) return { e: null, m: [], b: [], ct: 'OUT', args: [''] };
        const parts = line.split('->');
        if (parts.length !== 2) return { e: 'Falta o sobra ->', l: line };
        const [cond, act] = parts;
        const c = cond.split('|').map(x => x.trim());
        const parseTerm = t => {
            const m = t.match(/^(!?)([A-Za-z_][\w.]*)$/);
            if (m) return { nc: !!m[1], a: m[2] };
            const cmp = t.match(/^([A-Za-z_][\w.]*)\s*(>=|<=|==|!=|>|<)\s*(\d+)$/);
            if (cmp) return { cmp: [cmp[1], cmp[2], cmp[3]], a: t, nc: false };
            return null;
        };
        const m = c[0] ? c[0].split('&').map(x => x.trim()).map(parseTerm) : [];
        const b = c[1] ? c[1].split('&').map(x => x.trim()).map(parseTerm) : [];
        if (m.some(x => !x) || b.some(x => !x)) return { e: 'Contacto inválido', l: line };
        
        const ap = act.trim().split(/\s+/);
        const ct = ap.length === 1 ? 'OUT' : ap[0];
        const args = ap.length === 1 ? [ap[0]] : ap.slice(1);
        return { m, b, ct, args };
    });
};

export const compile = ({ ladder, g, HW, ip, mode, pid, vt, hmi }) => {
    let err = 0, warn = 0, list = [];
    const add = (sev, where, el, msg) => { list.push({ sev, where, el, msg }); if (sev === 'err') err++; if (sev === 'warn') warn++; };
    if (ip) add('err', 'Red', 'IP/Máscara', ip);
    
    // Validación general para todas las rutinas (Main y Subrutinas FC)
    Object.keys(ladder).forEach(routineName => {
        ladder[routineName].forEach((r, i) => {
            const w = `Network ${i + 1} (${routineName})`;
            if (r.e) return add('err', w, 'Sintaxis', r.e);
            if (!r.args[0]) return add('err', w, 'Bobina', 'Falta dirección');
            if (r.ct === 'CALL') {
                if (!ladder[r.args[0]]) add('err', w, 'Subrutina', `La subrutina ${r.args[0]} no existe.`);
            } else if (['TON', 'TOF', 'TP'].includes(r.ct)) {
                if (!r.args[1] || isNaN(r.args[1])) add('err', w, 'Temporizador', 'Falta tiempo base');
            }
        });
    });

    return { err, warn, list };
};