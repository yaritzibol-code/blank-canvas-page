# Actualización ATP de FlightPath · ASA 2025–2026

Implementación del 28 de septiembre de 2026, a partir de `0a2886453e34cbbc02d625b9a0ee42d7744b7066`.

## Resultado

**71 Learning Paths ATP**: 68 existentes y 3 nuevos. Hay 70 documentos en el registro ATP y un recorrido especializado, Applicable Regulations, que conserva su componente existente.

El alcance comprende capítulos 1, 2, 3, 6, 7 y 8, para aviones. No se incorporaron capítulos 4/5 ni enseñanza específica de helicópteros. No se cambiaron el banco ATP, cuestionarios, componentes visuales, navegación general, dependencias ni otras materias.

## Decisión para cada hallazgo

| Hallazgo | Acción | Implementación |
| --- | --- | --- |
| A01 · ADS-B | C · Nuevo | Out/In, fuente de posición, 1090ES/UAT, espacio aéreo, TIS-B/ADS-R/FIS-B, límites, transmisión y desviaciones diferenciadas. |
| A02 · GNSS y VOR MON | C · Nuevo | Verificación independiente, capacidad restante, coordinación ATC, respaldo convencional, cobertura MON y selección de una opción viable. |
| A03 · R-ATP | B · Ampliar | The ATP Certificate: limitaciones de §61.167(b), PIC/SIC, type rating y caso de flag/supplemental con tres o más pilotos. Remisión desde Experience and Training Requirements. |
| A04 · Programas de seguridad | C · Nuevo | VDRP, FOQA, ASAP y ASRS: participantes, datos, medidas correctivas, condiciones de protección y reportes obligatorios. Remisiones desde Emergency Equipment and Operations y NTSB. |
| A05 · RwyCC/FICON/RCAM | A + B | Landing: añadir poor, tabla de códigos, lectura por tercios, contaminantes y casos. NOTAMs remite a esa interpretación. |
| A06 · Buffet a gran altitud | B · Ampliar | High Speed Flight: baja velocidad/alto AOA, Mach, peso, altitud y load factor; distinción de mecanismos y caso de giro. |
| A07 · Speed adjustments | A + B | Tabla por altitud, fase y tipo; 250 kt/Mach equivalente, mínimos recomendados, excepciones y comunicación de limitaciones. Se contextualiza el ejercicio existente como salida de turbojet. |
| A08 · Factores humanos | B · Ampliar | Flight Physiology: ear block en descenso, decisión automática/analítica, probabilidad/severidad y responsabilidad del capitán dentro de CRM. |
| A09 · Hot spots | B · Ampliar | Airport Lighting and Marking: círculo/elipse frente a cilindro; Figure 241 y casos. Charts relaciona HS con la descripción. |
| C01 · MEDEVAC | A · Actualizar | Items on the Flight Plan: anotaciones Item 11/18, identificación verbal para prioridad, uso limitado al tramo urgente. |
| C02 · Medical a los 40 años | A · Actualizar | The ATP Certificate: 40 años o más frente a menos de 40, edad en el examen, meses calendario y privilegios PIC correspondientes. |
| E01 · Referencias | A · Actualizar | Edición y páginas temáticas en los 67 documentos existentes. Se remapean referencias citadas al libro 2025–2026 y se retiran 9310/9711 de Surface Analysis y 8839 de Charts. |
| E02 · Figures y aplicación | B · Ampliar | Figures reales 144, 241 y 293, con casos y captions. Tabla RVR tomada de §91.175(h), con condiciones y exclusión CAT II/III. |

## Recorridos nuevos y posición

Cada uno utiliza el motor ATP existente: Despegue, cinco etapas didácticas y Aterrizaje, tarjetas, tablas, exploraciones, seis ejercicios originales con feedback y comprobación final. Los **18 ejercicios nuevos** pertenecen únicamente a los nuevos recorridos; no se añadieron al banco ni a cuestionarios existentes.

| Nuevo Learning Path | Ubicación | Motivo pedagógico |
| --- | --- | --- |
| Safety Reporting Programs | Chapter 1, posición 16: después de NTSB y antes de Part 135 Regulations | Primero se distinguen las obligaciones de reporte; después, los canales voluntarios de aprendizaje. Evita saturar Emergency Equipment con cuatro programas diferentes. |
| GNSS Disruption and VOR MON | Chapter 2, posición 11: después de GPS | Parte de integridad y capacidad del receptor para construir una contingencia completa, hasta una aproximación y frustrada viables. |
| ADS-B | Chapter 2, posición 12: después de GNSS/MON y antes de Airport Lighting and Marking | Usa el conocimiento de la fuente de posición para enseñar vigilancia, enlaces y uso operacional como tema propio. |

Los IDs/URLs anteriores se conservan. Part 135 Regulations pasa a orden 17; Airport Lighting and Marking a 13 y Approach Lighting a 14. La inserción se hace en el catálogo existente, sin cambiar la lógica de navegación.

## Learning Paths existentes modificados

Contenido o remisiones: **15**.

1. The ATP Certificate.
2. Experience and Training Requirements.
3. Emergency Equipment and Operations.
4. National Transportation Safety Board (NTSB).
5. GPS.
6. Airport Lighting and Marking.
7. High Speed Flight.
8. NOTAMs (Notices To AirMen).
9. Items on the Flight Plan.
10. Instrument Approaches.
11. Landing.
12. Speed Adjustments.
13. Charts.
14. Flight Physiology.
15. Wind Shear.

Además, los **67 documentos ATP existentes** tienen referencias/metadata de páginas actualizadas; eso no significa que se hayan reescrito sus explicaciones. Part 135 Regulations y Approach Lighting reciben también el ajuste de posición. Applicable Regulations conserva su contenido.

Se preservan las etapas y las 298 preguntas internas existentes, sus respuestas y explicaciones. Las exploraciones nuevas se agregan después de las anteriores para conservar índices. Los recorridos ya completados mantienen sus IDs. Las etapas previas guardadas no se renumeran.

## Referencias

El archivo `src/lib/lp/atp-references.2026.json` registra las páginas de cada tema y los lugares del libro donde aparecen las referencias citadas. Distingue la ubicación principal de referencias temáticas ubicadas en otra sección. Las explicaciones nuevas están redactadas para FlightPath; no se importaron explicaciones completas de ASA.

Fuentes oficiales empleadas:

- [14 CFR §61.167](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-G/section-61.167), §61.23(d) y [FAA Medical Certificate Validity](https://www.faa.gov/ame_guide/app_process/general/validity): privilegios y medical.
- [14 CFR §91.225](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-C/section-91.225), §91.227, [FAA ADS-B FAQ](https://www.faa.gov/air_traffic/technology/equipadsb/resources/faq) y [AIM 4-5](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_5.html): equipamiento, servicios y desviaciones.
- [AIM 1-1-3 y 1-1-17](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html) y [FAA VOR MON](https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gbng/vormon): navegación de respaldo.
- [FAA VDRP](https://vdrp.faa.gov/Help/VDRPHlp/Welcome.htm), [AC 120-82](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-82.pdf), [FAA ASAP](https://www.faa.gov/about/initiatives/asap) y [NASA ASRS / AC 00-46F](https://asrs.arc.nasa.gov/overview/immunity.html): programas de seguridad.
- [AIM 4-3-8/9](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_3.html): braking action, RwyCC y RCAM.
- [AC 61-107B, Change 1](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-107B_CHG_1_FAA.pdf): buffet a gran altitud.
- [AIM 4-4-12](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_4.html): ajustes de velocidad.
- [AIM 8-1-2](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap8_section_1.html), [FAA-H-8083-25C](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/faa-h-8083-25c.pdf) y §91.3: presión, ADM y responsabilidad PIC.
- [FAA Hot Spot Standardized Symbology](https://www.faa.gov/newsroom/hot-spot-standardized-symbology): símbolos y riesgo de superficie equivocada.
- [FAA AIP, Aircraft Call Signs / Air Ambulance Flights](https://www.faa.gov/air_traffic/publications/atpubs/aip_html/chap4_section_2.html): MEDEVAC.
- [14 CFR §91.175(h)](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-B/section-91.175): conversión RVR cuando no se reporta.

## Figures y recursos visuales

Se copiaron tres Figures individuales ya disponibles en el repositorio desde `supabase/storage/atp-images` a `public/learning-paths/atp/2026`. Su contenido y hash permanecen iguales; no dependen de desplegar un bucket de preguntas ni se modificaron los recursos del banco.

| Recurso | Learning Paths | Uso |
| --- | --- | --- |
| Figure 144 · Microburst Section Chart | Wind Shear | Casos de entrada, downdraft y salida; mejora inicial frente a peligro posterior. |
| Figure 241 · Hot Spots | Airport Lighting and Marking; Charts | Vincular aeropuerto, número HS y descripción de amenaza. La simbología actual se explica por separado, porque el texto de esa lámina es histórico. |
| Figure 293 · VOR or GPS RWY 13L/13R (JFK) | Charts; Instrument Approaches | Leer equipo, notas, perfil, altitudes, MAP y extremo de pista. |
| Tabla RVR / ground visibility | Instrument Approaches | Valores de §91.175(h), condiciones de uso y ejemplo de 4,000 ft. |
| Tablas de códigos, velocidades y programas/capacidades | Landing, Speed Adjustments y nuevos recorridos | Comparar condiciones que cambian la decisión. |

Las cartas se identifican como material histórico de examen y no como cartas vigentes para navegación. El diseño y los componentes de presentación son los mismos.

## Verificación

- Comprobación de 71 entradas de catálogo, 70 documentos, IDs únicos y colocación de los tres recorridos nuevos.
- Exclusión de capítulos 4/5 y contenido específico de helicópteros en los recorridos nuevos.
- Comparación de todas las etapas y las 298 preguntas existentes; sin cambios de preguntas, respuestas o explicaciones.
- Verificación de índices previos de exploraciones, numeración del catálogo, referencias y hashes de Figures.
- TypeScript sin errores y compilación de producción satisfactoria. La compilación presenta avisos preexistentes de dependencias; no se actualizaron versiones.
- Chrome local, con `AtpLearningPath`, `LearningPathExperience` y sus estilos reales: completar los tres nuevos recorridos, bloquear avance con respuesta incorrecta, corregir, recargar y conservar avance/completado. El modal de reportes queda fuera de esa prueba local.
- Carga de Figures 144/241/293, visibilidad de tablas, revisión de capturas y ancho móvil de 390 px sin desbordamiento de página ni errores de ejecución.
- Revisión de cambios: banco, migraciones ATP, cuestionarios, rutas generales y estilos sin modificaciones.

La prueba de estructura se ejecuta con `node tests/atp-learning-paths-2026.cjs`. El contenido original se conserva como base y la revisión se aplica desde `atp-content.2026.ts`, lo que permite revisar los cambios sin mezclar una reescritura de más de un megabyte de material correcto.

## Revisión manual y límites restantes

Los 13 hallazgos tienen una implementación dentro de Learning Paths. Dos discrepancias se conservan como asuntos editoriales explícitos:

1. **ASA 9945 / TIS-B:** la formulación del libro puede inducir a confundir recepción TIS-B con el requisito para Class A. El nuevo recorrido enseña la regla FAA de ADS-B Out 1090ES. El banco no se modificó; cualquier corrección de su pregunta queda fuera del alcance autorizado.
2. **RVR CAT II:** el recorrido existente identifica cifras diferentes en ASA. No se selecciona una cifra universal para todas las autorizaciones. La tabla añadida de §91.175(h) excluye CAT II/III; los mínimos operacionales requieren revisar el procedimiento, equipo y autorización concretos. La comparación editorial de los ejemplos ASA sigue señalada para revisión manual.

No se realizó merge ni despliegue a producción como parte de esta implementación.
