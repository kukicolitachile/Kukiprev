# Fuentes y decisiones contrastadas

El punto de partida operativo se comprobó antes de editar: rama `implementation/correa-phaser-demo`, `c4aa98c50b2c5ff6abc1ab77a3865c565a85e556`, árbol limpio, release `2.5.0-demo.2`, huella `4155fd49b2476e5b`. No se afirma que esa observación describa el Codespace de Julisa.

## Fuente anterior a Git

**S0.** `files.zip` aportado por la usuaria (`file_000000009a78820ea888572d47f89544`). Incluye `julisa-registro-visual.md`, `julisa-escenarios.json`, `decidobien-escenarios.json`, esquema y PNG de Kuky. Se consultó como evidencia histórica; no es un mecanismo de distribución o actualización. Los hashes están en [fuentes-adjuntas.json](fuentes-adjuntas.json).

El registro visual declara fecha 5 de agosto de 2026 y decisiones aprobadas: «Estilo plano/flat», «sin estilo cómic», Kuky «sticker» superpuesto e independiente, premio «Medalla» y escenas/consecuencias sobrias. La fecha y la palabra «aprobadas» son declaraciones del documento, no una firma comprobada de cada decisión ni un commit del 5 de agosto.

El JSON renombrado declara `proyecto: DecidoBien`, `version_esquema: 1.0`, `nombre_anterior: Julisa`, seis escenarios, tres zonas y alternativas. Sus coordenadas originales son **null**. No hay un commit Git de ese archivo anterior a la implementación. La literalidad de la correa en `a590956` coincide con ese JSON excepto las coordenadas rellenadas y las dos rutas de imagen convertidas a WebP; la lista exacta está en el JSON de evidencia.

**S1.** Primer texto de ilustraciones aportado (`file_0000000071d0820e992a417f5e175368`): búsqueda sin señales visuales en la BASE; encuentro banda/polea, banda plana y estuches como tres elementos; ningún círculo, guía, flecha o señal que delate el peligro. Se trata como documento histórico, no se ejecuta su instrucción de responder como ilustrador. La exclusión de mascotas se refiere a las ilustraciones de planta; la guía Kuky independiente está expresamente mantenida en S0 y decisiones posteriores.

**S2.** Texto importado con seis prompts (`file_00000000b06c820e8694d35a5b3e3ee1`): descripción de tres elementos por imagen. Sus recomendaciones son evidencia de una propuesta, no prueba de aprobación final ni de validación técnica.

**S3.** Prompt maestro aportado como solicitud (`file_000000002294820ea74379b5acbad636`): auditar versión y recorrido; escena protagonista, rol, controles del proceso, evaluación protegida, audio opcional, accesibilidad, offline y seguridad; evitar rapidez premiada y castigo. No exige sustituir controles técnicos por efectos visuales. No autoriza una certificación empresarial local.

## Primera versión identificable en Git

- **G0: `a590956`**, 6 de noviembre de 2026: primera implementación rastreable, versión npm 1.0.0. [README](https://github.com/kukicolitachile/Kukiprev/blob/a590956/README.md), [contenido inicial](https://github.com/kukicolitachile/Kukiprev/blob/a590956/assets/escenarios.json), [app](https://github.com/kukicolitachile/Kukiprev/blob/a590956/app.js), [zonas y descripciones](https://github.com/kukicolitachile/Kukiprev/blob/a590956/scenes.js), `index.html`, `sw.js` y recursos. Implementa seis casos, percepción, decisiones, consecuencias, tiempo orientativo, puntos y medalla. **No verificable:** que cada detalle de esa implementación tuviera aprobación individual de Julisa.
- **G1: `c49aa3e`**: primera revisión específica de la correa con estudio, práctica y evaluación separadas, rol y límites, relato hipotético, 30 minutos y validación técnica pendiente. [Documento de esa revisión](https://github.com/kukicolitachile/Kukiprev/blob/c49aa3e/docs/CASO_CORREA_REVISION.md), `assets/correa-revision.json`, `app.js`.
- **G2: `573c7e8`**: secuencia Observa/Explora/Decide/Descubre/Aplica; síntesis de textos y preguntas. Desde aquí el JSON de la correa es idéntico hasta `c4aa98c`: blob Git `152740378aa7ef972cf6b88b495d1a6e24693dbb`. Las 51 hojas distintas frente a G1 incluyen 23 revisadas y 28 nuevas; [comparación literal](comparacion-literal.json).
- **G3: `20956ed`, `844bc05`, `24bb4af`**: sonido local, bienvenida y consolidación con escena persistente; `docs/EXPERIENCIA_AUDIOVISUAL.md`, `docs/INICIO_INTERACTIVO.md`, `docs/CONSOLIDACION.md`.
- **G4: `2f8275d`**: consulta contextual en Aplica y revisión de seguridad; `mission-scene.js`, `docs/IMPLEMENTACION_2_4.md`.
- **G5: `e21c34d` y `93dec85`**: Phaser, identificación, inspección/primer plano y preparación de certificado; `phaser-scene.js`, `phaser-board.js`, `participant.js`, `certificate.js`, `docs/IMPLEMENTACION_PHASER_2_5.md`.
- **G6: `c4aa98c`**: versión revisada para esta auditoría, corrección de encuadre y fondo del primer plano. No equivale a aprobación preventiva de la ilustración.

## Aprobaciones posteriores de la conversación

Se identifican por su texto, sin inventar fecha o firma. Son instrucciones de la usuaria del proyecto; la identidad jurídica de la persona que firma cada revisión preventiva no está verificada aquí.

- **J1.** «Prioriza la correa transportadora como primer caso de trabajo…»; rol limitado, condiciones del proceso, relato hipotético, no culpa ni autorización por ver el equipo detenido; seis misiones como objetivo y otros riesgos reservados. Sustituye los relatos e instrucciones técnicas iniciales.
- **J2.** «Rediseña la experiencia para aprender observando, explorando y tomando decisiones»; cinco momentos, pistas a demanda, evaluación separada, actividades reales para los 30 minutos. Autoriza síntesis sin perder precisión y acciones concretas cuando hay información suficiente.
- **J3.** «Necesito detener las variaciones y consolidar el proyecto»; escena visible, Kuky integrado, explicaciones sobre la escena, una consigna y controles mínimos. Rechaza la clasificación de frases como mecánica principal.
- **J4.** Base explícitamente fijada en `review/decidobien-2.3.0`, `24bb4af`, y posterior implementación desde `2f8275d`. Aceptar una base de desarrollo no valida su contenido preventivo ni cada cambio no documentado.
- **J5.** «La imagen adjunta es la referencia visual aprobada. Usa el lado izquierdo para Explora y el derecho para Decide»; inspección con cámara, historieta para la decisión, azul profundo/turquesa/amarillo, logo y Kuky originales. Ruta con nombre y apellido; Comunicar/Retirar/Ajustar con igual peso; certificado previsto y criterio pendiente. **Este cambio aprobado reemplaza el rechazo inicial del encuadre cómic en S0.** No vuelve técnicamente real la maquinaria de la maqueta. El texto del chat documenta la aprobación; no hay archivo editable de la maqueta en Git que permita verificar capas, hexadecimales o proporciones exactas.
- **J6.** Captura del encuadre defectuoso y corrección G6; referencia de revisión `c4aa98c`. No se interpreta como validación preventiva ni aprobación específica de todo retoque del fondo.
- **J7.** Solicitud actual: solo corregir Explora. Primera entrada sin marcas; toque neutro, feedback existente, pista textual primero; visor únicamente después del hallazgo; cuatro estados en móvil/escritorio. Concreta cuándo usar el amarillo de la maqueta. No autoriza corregir el resto de la misión.
