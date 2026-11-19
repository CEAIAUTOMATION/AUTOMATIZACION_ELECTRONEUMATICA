// js/isa.js (Adaptado a Norma ISO 1219-2 para Electroneumática)

export const CATS = ['Alimentación', 'Actuadores', 'Válvulas Direccionales', 'Válvulas de Caudal', 'Sensores', 'Eléctricos'];

export const KINDS = {
    'p': ['Línea de Presión/Trabajo', '#3d6b93', 2, 'none'],
    'c': ['Línea de Pilotaje Neumático', '#3d6b93', 1, '4 4'],
    'e': ['Señal Eléctrica (IEC)', '#7f97ad', 1, '2 2']
};

// Designación de elementos según ISO 1219-2 (Ej: 1A1, 1V2, 1S1)
export const LET1 = [
    ['A', 'Actuadores (Cilindros, Motores)'], 
    ['V', 'Válvulas (Direccionales, Control)'], 
    ['S', 'Sensores y Pulsadores'], 
    ['Z', 'Elementos Lógicos (AND/OR)']
];

export const LET2 = [
    ['1', 'Grupo/Lazo 1'], ['2', 'Grupo/Lazo 2'], ['3', 'Grupo/Lazo 3']
];

export const ins = (o) => {
    const l = o.tag || '';
    const t = (y) => `<text x="30" y="${y}" text-anchor="middle" font-size="10">${l}</text>`;
    // Base para instrumentos/marcas personalizadas
    return `<rect x="5" y="15" width="50" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/>${t(34)}`;
};

export const ISA = {
    // ALIMENTACIÓN
    'air': { n: 'Fuente de Aire', c: 'Alimentación', p: 'P', s: '<circle cx="30" cy="30" r="10" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><circle cx="30" cy="30" r="2" fill="var(--tx)"/>' },
    'frl': { n: 'Unidad FRL', c: 'Alimentación', p: '0Z', s: '<rect x="15" y="20" width="30" height="20" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><line x1="15" y1="30" x2="45" y2="30" stroke="var(--tx)" stroke-dasharray="2 2"/>' },
    
    // ACTUADORES
    'cyl_sa': { n: 'Cilindro Simple Efecto', c: 'Actuadores', p: 'A', s: '<rect x="10" y="20" width="40" height="20" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><line x1="30" y1="30" x2="60" y2="30" stroke="var(--tx)" stroke-width="2"/><path d="M15 20 L25 30 L15 40" fill="none" stroke="var(--tx)"/>', io: 'DO' },
    'cyl_da': { n: 'Cilindro Doble Efecto', c: 'Actuadores', p: 'A', s: '<rect x="10" y="20" width="40" height="20" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><rect x="25" y="20" width="8" height="20" fill="var(--tx)"/><line x1="33" y1="30" x2="60" y2="30" stroke="var(--tx)" stroke-width="2"/>', io: 'DO' },
    
    // VÁLVULAS DIRECCIONALES
    'v32_nc': { n: 'Válvula 3/2 NC', c: 'Válvulas Direccionales', p: 'V', s: '<rect x="10" y="15" width="20" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><rect x="30" y="15" width="20" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><path d="M20 20 L20 40 M40 20 L40 40" stroke="var(--tx)"/><path d="M15 25 L20 20 L25 25" fill="none" stroke="var(--tx)"/>', io: 'DO' },
    'v52_bi': { n: 'Válvula 5/2 Biestable', c: 'Válvulas Direccionales', p: 'V', s: '<rect x="10" y="15" width="20" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><rect x="30" y="15" width="20" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><line x1="20" y1="20" x2="20" y2="40" stroke="var(--tx)"/><line x1="40" y1="20" x2="40" y2="40" stroke="var(--tx)"/>', io: 'DO' },
    
    // VÁLVULAS DE CAUDAL / LÓGICA
    'v_and': { n: 'Válvula de Simultaneidad (AND)', c: 'Válvulas de Caudal', p: 'V', s: '<rect x="15" y="15" width="30" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><circle cx="30" cy="30" r="10" fill="transparent" stroke="var(--tx)"/><circle cx="30" cy="30" r="2" fill="var(--tx)"/>' },
    'v_flow': { n: 'Reguladora de Caudal', c: 'Válvulas de Caudal', p: 'V', s: '<path d="M15 30 Q 30 10 45 30 Q 30 50 15 30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><line x1="10" y1="15" x2="50" y2="45" stroke="var(--tx)"/>' },

    // SENSORES Y ELÉCTRICOS (IEC)
    'sens_mag': { n: 'Sensor Magnético (Cilindro)', c: 'Sensores', p: 'S', s: '<rect x="20" y="20" width="20" height="20" transform="rotate(45 30 30)" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/>', io: 'DI' },
    'sens_opt': { n: 'Sensor Óptico (Reflex)', c: 'Sensores', p: 'S', s: '<rect x="15" y="15" width="30" height="30" fill="transparent" stroke="var(--tx)" stroke-width="1.5"/><circle cx="25" cy="25" r="4" fill="var(--tx)"/><circle cx="35" cy="35" r="4" fill="var(--tx)"/>', io: 'DI' },
    'pb_no': { n: 'Pulsador NA (Eléctrico)', c: 'Eléctricos', p: 'S', s: '<line x1="10" y1="30" x2="20" y2="30" stroke="var(--tx)" stroke-width="1.5"/><line x1="40" y1="30" x2="50" y2="30" stroke="var(--tx)" stroke-width="1.5"/><line x1="20" y1="20" x2="40" y2="20" stroke="var(--tx)" stroke-width="1.5"/><line x1="30" y1="10" x2="30" y2="20" stroke="var(--tx)" stroke-width="1.5"/>', io: 'DI' }
};