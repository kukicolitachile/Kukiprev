// Percentages of the full, uncropped 9:16 artwork: x, y, width, height.
// Order matches the three perception zones in assets/escenarios.json.
export const zones=[
 [[64,63,32,15],[22,44,36,11],[0,33,25,10]],
 [[30,34,46,12],[75,14,25,12],[48,63,50,30]],
 [[5,49,42,13],[51,23,19,16],[62,77,37,15]],
 [[36,33,20,12],[17,22,15,10],[57,23,18,9]],
 [[50,30,15,10],[30,60,40,13],[15,79,65,8]],
 [[65,5,33,24],[56,72,18,10],[2,58,34,24]]
];
export const descriptions=[
 'Persona de producción junto a una faja transportadora con estuches acumulados, un tramo vacío de banda y la polea del extremo.',
 'Persona de producción junto a una encartonadora con rodillos, panel de control y cajas terminadas sobre un pallet.',
 'Persona de producción con espátula junto a una tableteadora, su control de velocidad y frascos de tabletas.',
 'Persona de laboratorio frente a un autoclave cerrado con manómetro, luz indicadora y temporizador.',
 'Persona de laboratorio sosteniendo un matraz de vidrio con etiqueta blanca y líquido en el fondo.',
 'Persona de laboratorio realizando un trasvasije; documento en la pared, frasco etiquetado y bidón sobre la mesa.'
];
export const consequences=[
 'Persona de producción sentada, sosteniendo su mano con los dedos vendados.',
 'Persona de producción sentada con la palma vendada apoyada en la rodilla.',
 'Persona de producción sosteniendo su mano vendada contra el pecho.',
 'Persona de laboratorio sentada con un vendaje blanco en el antebrazo.',
 'Persona de laboratorio sentada sosteniendo su mano con un dedo vendado.',
 'Persona de laboratorio enjuagando una mano bajo el agua en una estación de emergencia.'
];
export function imagePath(i,consequence=false){return `assets/escenas/esc-${String(i+1).padStart(2,'0')}-${consequence?'consecuencia':'base'}.webp`;}
export function sceneMarkup(i,consequence=false){return `<img class="scene-art" src="./${imagePath(i,consequence)}" alt="${consequence?consequences[i]:descriptions[i]}" width="941" height="1672" decoding="async">`;}
