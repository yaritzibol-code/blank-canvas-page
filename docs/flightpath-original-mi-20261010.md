# MI: ejemplos gráficos originales FlightPath

## Alcance

Sustitución docente de MI04, MI07, MI08, MI09 y MI10, con datos y gráficos vectoriales originales. Se retiraron íntegramente 29 PNG de la carpeta pública MI: 25 usados y 4 sin uso. Los 25 recursos utilizados quedan cubiertos por 24 SVG originales; algunos paneles se comparten. El antiguo esquema de transición se conserva como archivo histórico, pero sus referencias activas se sustituyeron para evitar mezclar valores.

No se han reproducido cartas de proveedores, páginas de manuales, marcas, mapas de terreno ni procedimientos de aeropuertos reales. Alba, Ladera, AULA y sus rutas son escenarios inventados. Los identificadores, frecuencias, mínimos, restricciones, fechas y horarios de esos casos sólo sirven para lectura. Ninguna figura acredita diseño de procedimientos, franqueamiento de obstáculos o autorización operacional.

## Cobertura conservada

- MI04: indicador de aeródromo frente a ayuda localizadora; elevación y datum; lugar/fecha/UTC de un horario solar; necesidad de consultar la leyenda aplicable. La leyenda de aula no afirma ser simbología oficial.
- MI07: identidad, comunicaciones, MSA, planta, perfil, mínimos DA/MDA y frustrada. El título y la URL del catálogo permanecen estables; el contenido explica que los paneles originales son una herramienta de lectura y no una reproducción del formato comercial.
- MI08: guía 2D/3D; condiciones de reversión ILS/LOC; diferencias entre umbral, TDZE y elevación de aeródromo; mínimo directo y circling; GNSS, líneas LNAV/VNAV y LNAV y una restricción de temperatura explícitamente ficticia.
- MI09: estación VOR/DME, distancia oblicua, arco de radio constante con altitudes distintas, IF y transición. IF/D10 se cruza a 6,200 ft; se desciende después del IF hasta 5,800 ft en D8. LOC-ARC pertenece a un escenario independiente de Alba y Ladera.
- MI10: espera izquierda con inbound 090° y outbound 270°, altitud y lado de espera; ruta de frustrada separada. No se inventan velocidad, longitud de tramo o entrada que el esquema no especifica.

Los diez LP mantienen sus identidades y versiones de recorrido. Permanecen 69 tableros, 328 tarjetas y 169 referencias de figura, con correspondencia exacta entre catálogo y etapas. Los cinco ejercicios cambian sus pares y etiquetas de comprobación. El campo assessmentVersion identifica esa revisión sin cambiar contentVersion. Su integración con la migración de evaluaciones se valida por separado; este bloque no modifica el migrador ni los puntos/completados del usuario.

Los gates, catálogo y registro de revisión MI no se modificaron. Los localizadores de capturas retiradas se quitaron de las cinco lecciones; las fuentes conceptuales anteriores ajenas a esas capturas permanecen con sus límites originales.

## Fuentes públicas verificadas el 10 de octubre de 2026

Las siguientes referencias son primarias FAA. Se usan para comprobar conceptos generales, con su jurisdicción estadounidense; no se presentan como reglas mexicanas ni como autorización de una operación. Los valores de los escenarios no proceden de estas publicaciones.

- [FAA PCG, A: airport/aerodrome elevation](https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-a.html): distingue elevación de aeródromo de una referencia de umbral.
- [FAA PCG, T: TDZE](https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-t.html): la elevación de la zona de toma de contacto no es sinónimo de elevación del umbral.
- [FAA AIM, 5-4-5 y 5-4-21](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_4.html): lectura de mínimos; MSA para emergencia, normalmente 25 NM; distinción entre DA y MDA; cumplimiento de ruta y altitud de frustrada, sin adelantar indebidamente virajes.
- [FAA PCG, D: DA/DH](https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-d.html): DA sobre MSL y definición OACI de DH respecto al umbral.
- [FAA PCG, M: MDA y MHA](https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-m.html): mínimo de descenso y mínimo de espera son conceptos distintos.
- [FAA AIM, 1-1-7 y 1-1-11](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html): DME como distancia oblicua en NM a la estación identificada.
- [FAA JO 7110.65, 6-5-3](https://www.faa.gov/Air_traffic/publications/atpubs/atc_html/chap6_section_5.html): arco respecto a una radioayuda y distancia DME especificada. No se trasladan las separaciones ATC de esa sección al ejercicio.
- [FAA AIM, 5-3-8](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_3.html): espera estándar a derecha, no estándar a izquierda; distinción de cursos y límites de tramo.

## Verificación y límites

- Pruebas de integridad: 783 subárboles no modificados y 920 valores cambiados inventariados mediante hashes, sin incluir bytes de las imágenes retiradas. Los diez documentos públicos completos se comprueban contra sus hashes de contenido. La inversión hasta los candidatos originales se comprueba por separado y no se atribuye a los fixtures públicos.
- Las 125 correcciones históricas se contabilizan en el fixture público: 103 conservadas y 22 sustituidas explícitamente por esta capa. Se prueban 94 inversiones didácticas exactas y cinco valores didácticos sustituidos. Los 26 registros de metadatos de fuentes se representan sólo mediante hashes; nueve conservan sus valores públicos actuales y 17 fueron sustituidos. La inversión histórica completa se verifica por separado. Los 10 SVG de la corrección anterior permanecen intactos.
- Pruebas semánticas de las cinco respuestas: cifras, resta de altura, datum, GNSS, radial/estación, curso y recíproco, geometría de espera y referencias de figura duplicadas.
- Los 24 SVG tienen title/desc, role y etiquetas accesibles; no contienen scripts, bitmaps, recursos externos o datos privados. Los datos principales se repiten en tarjetas legibles.
- Inspección raster estática a 360 px y comprobación de límites de texto con métricas Arial/Liberation Sans; sin desbordamientos laterales. Se revisaron los diagramas de perfil, arco, sectores y espera después de corregir cruces entre trazos y texto.
- Prueba nativa SSR/DOM de MI aprobada. La verificación interactiva de navegador está pendiente: el entorno no permitió iniciar el navegador. No se afirma que el zoom interactivo esté verificado.
- No se realizó publicación, despliegue ni envío a una rama remota.

El manifiesto JSON adjunto documenta activos, sustituciones, cobertura, hashes, campos preservados y excepciones. Sus hashes de documentos auxiliares corresponden a los fixtures públicos mínimos; los hashes de runtime, catálogo y gates no cambian. El alcance de las pruebas públicas se detalla en [ciaac-manuals-public-test-coverage.md](ciaac-manuals-public-test-coverage.md). Es un registro de esta revisión docente, no una acreditación de permisos de terceros.
