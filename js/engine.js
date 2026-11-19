// js/engine.js
export const newRT = () => ({ T: {}, C: {}, act: 0, gT: 0, callStack: 0 });

export const power = (r, get) => {
    const ev = t => t.cmp ? eval(`${get(t.cmp[0])} ${t.cmp[1]} ${t.cmp[2]}`) : (t.nc ? !get(t.a) : get(t.a));
    const mOn = r.m.length && r.m.every(ev);
    const bOn = r.b.length && r.b.every(ev);
    return mOn || bOn;
};

export const tv = (t, get) => {
    return t.cmp ? eval(`${get(t.cmp[0])} ${t.cmp[1]} ${t.cmp[2]}`) : (t.nc ? !get(t.a) : get(t.a));
};

export const inst = (ct, args, on, rt, get, set, dt, programLoaded) => {
    const [a, b] = args;
    if (ct === 'OUT') set(a, on ? 1 : 0);
    else if (ct === 'S' && on) set(a, 1);
    else if (ct === 'R' && on) set(a, 0);
    else if (ct === 'CALL' && on) {
        // Ejecución de subrutina
        if (rt.callStack > 5) throw new Error('Stack Overflow: Recursión infinita en CALL.');
        rt.callStack++;
        if (programLoaded && programLoaded.rungs && programLoaded.rungs[a]) {
            programLoaded.rungs[a].forEach((r, i) => rung(r, i, rt, get, set, dt, programLoaded));
        }
        rt.callStack--;
    }
    else if (['TON', 'TOF', 'TP'].includes(ct)) {
        if (!rt.T[a]) rt.T[a] = { el: 0, in: 0, q: 0 };
        const t = rt.T[a], pt = +b;
        if (ct === 'TON') { if (on) t.el += dt; else t.el = 0; t.q = t.el >= pt ? 1 : 0; }
        if (ct === 'TOF') { if (!on) t.el += dt; else t.el = 0; t.q = on || (t.el < pt) ? 1 : 0; }
        if (ct === 'TP')  { if (on && !t.in) { t.el = 0; t.q = 1; } if (t.q) t.el += dt; if (t.el >= pt) t.q = 0; }
        t.in = on; set(a, t.q);
    }
    else if (['CTU', 'CTD'].includes(ct)) {
        if (!rt.C[a]) rt.C[a] = { v: 0, in: 0, q: 0 };
        const c = rt.C[a], pv = +b;
        if (on && !c.in) { if (ct === 'CTU') c.v++; else c.v--; }
        c.q = (ct === 'CTU' ? c.v >= pv : c.v <= pv) ? 1 : 0;
        c.in = on; set(a, c.q);
    }
    else if (ct === 'RES') {
        if (on) { if (rt.T[a]) { rt.T[a].el = 0; rt.T[a].q = 0; } if (rt.C[a]) { rt.C[a].v = 0; rt.C[a].q = 0; } set(a, 0); }
    }
};

export const rung = (r, i, rt, get, set, dt, programLoaded) => {
    if (r.e) return;
    const on = power(r, get);
    inst(r.ct, r.args, on, rt, get, set, dt, programLoaded);
};

const evalG = (node, get) => {
    if (!node) return 1;
    if (node.op === 'val') return node.val;
    if (node.op === 'var') return node.id === 'T' ? 0 : get(node.id);
    if (node.op === 'not') return !evalG(node.arg, get);
    const l = evalG(node.left, get), r = evalG(node.right, get);
    if (node.op === '&') return l && r;
    if (node.op === '|') return l || r;
    if (node.op === '>=') return l >= r;
    if (node.op === '<=') return l <= r;
    if (node.op === '==') return l === r;
    return 0;
};

export const grafcet = (L, rt, get, set, dt) => {
    rt.gT += dt;
    const s = L.g[rt.act];
    if (!s) return;
    
    // Evaluar receptividad
    const trans = L.gp[rt.act];
    const pass = trans ? evalG(trans, get) : 0;
    
    if (pass) {
        // Apagar salidas de etapa anterior
        if (s.acts) {
            acts(s.a).forEach(x => { if (x.op === 'out') set(x.id, 0); });
        }
        rt.act = s.n;
        rt.gT = 0;
    }
    
    // Ejecutar acciones de etapa actual
    const ns = L.g[rt.act];
    if (ns && ns.acts) {
        acts(ns.a).forEach(x => {
            if (x.op === 'out' || x.op === 'S') set(x.id, 1);
            if (x.op === 'R') set(x.id, 0);
        });
    }
};