CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'CIAAC',
  cover_image text,
  content text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'Equipo FlightPath',
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft',
  reading_time integer NOT NULL DEFAULT 5,
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  cta_title text,
  cta_text text,
  cta_link text,
  CONSTRAINT blog_posts_status_chk CHECK (status IN ('draft','published','archived')),
  CONSTRAINT blog_posts_category_chk CHECK (category IN ('CIAAC','Aerolíneas','Convocatorias'))
);

CREATE INDEX blog_posts_status_pub_idx ON public.blog_posts (status, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog publicos lectura" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "blog admin lectura" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "blog admin escritura" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "blog admin update" ON public.blog_posts
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "blog admin delete" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO public.blog_posts (title, slug, excerpt, category, cover_image, content, published_at, updated_at, status, reading_time, tags, featured, cta_title, cta_text, cta_link) VALUES
(
 'Guía CIAAC: todo lo que necesitas para preparar tu EGE-PC',
 'guia-ciaac',
 'La guía completa para entender el CIAAC, conocer el EGE-PC y organizar tu preparación.',
 'CIAAC',
 '/blog/portada-ciaac.jpg',
 $md$Si estás por presentar el CIAAC, probablemente tienes muchas preguntas: ¿qué es?, ¿qué tengo que estudiar?, ¿cuándo sale la convocatoria?, ¿cómo sé si estoy listo? Esta guía reúne lo esencial para organizar tu preparación.

## ¿Qué es el CIAAC?

El **CIAAC** es el Centro Internacional de Adiestramiento de Aviación Civil. En el caso de piloto comercial, el examen que encontrarás en la documentación oficial es el **Examen General de Egreso para Piloto Comercial (EGE-PC)**.

Más a fondo: [¿Qué es el CIAAC?](/blog/que-es-el-ciaac)

## ¿Qué evalúa?

La evaluación busca comprobar los conocimientos correspondientes a la formación del piloto comercial. El contenido exacto debe revisarse en la **guía oficial de la convocatoria vigente**.

Más a fondo: [¿Qué evalúa el CIAAC?](/blog/que-evalua-el-ciaac)

## ¿Cuándo es?

Las fechas dependen de cada convocatoria. Consulta siempre la información oficial de la AFAC.

Más a fondo: [¿Cuándo sale la convocatoria CIAAC 2027?](/blog/cuando-sale-la-convocatoria-ciaac-2027)

## ¿Cómo estudiar?

Una buena preparación combina **aprendizaje + práctica + recuperación + análisis de errores + repaso**. No necesitas solamente más horas: necesitas saber dónde estás fallando.

Más a fondo: [¿Cómo estudiar para el CIAAC?](/blog/como-estudiar-para-el-ciaac)

## ¿Qué hago si repruebo?

No necesariamente tienes que empezar desde cero. Analiza tu resultado y utiliza la experiencia para identificar qué debes cambiar.

Más a fondo: [Reprobé el CIAAC, ¿y ahora qué?](/blog/reprobe-el-ciaac-y-ahora-que)

## Checklist antes del examen

- Revisé la convocatoria oficial.
- Revisé la guía del sustentante.
- Organicé el temario.
- Identifiqué mis áreas débiles.
- Practiqué preguntas.
- Analicé mis errores.
- Hice simulaciones.
- Revisé las instrucciones del examen.

> Las fechas, requisitos y procedimientos pueden cambiar. Consulta siempre la convocatoria oficial vigente de la AFAC.$md$,
 '2026-09-01', '2026-09-09', 'published', 7, ARRAY['CIAAC','EGE-PC','guía'], true,
 'Prepárate para el CIAAC con FlightPath',
 'Banco de preguntas por materia, simulador y análisis de tus errores para saber exactamente qué reforzar.',
 '/ciaac'
),
(
 '¿Qué es el CIAAC?',
 'que-es-el-ciaac',
 'Todo lo que necesitas saber sobre el CIAAC y el Examen General de Egreso para Piloto Comercial antes de comenzar tu preparación.',
 'CIAAC',
 '/blog/portada-ciaac.jpg',
 $md$Si estás estudiando para ser piloto comercial, probablemente has escuchado hablar del CIAAC desde el inicio de tu formación. Pero ¿qué es realmente y qué tiene que ver con tu camino para convertirte en piloto?

El **CIAAC** es el Centro Internacional de Adiestramiento de Aviación Civil, relacionado con la formación y evaluación del personal aeronáutico. En el caso de los pilotos comerciales, uno de los procesos más importantes es el **Examen General de Egreso para Piloto Comercial (EGE-PC)**.

## ¿El CIAAC es el examen?

Aquí existe una confusión bastante común. Muchas personas utilizan "CIAAC" para referirse al examen, pero el nombre oficial del examen es **Examen General de Egreso para Piloto Comercial (EGE-PC)**.

La AFAC publica las convocatorias correspondientes y establece en ellas las fechas, requisitos e instrucciones que deben seguir los sustentantes.

## ¿Por qué es importante?

Porque no se trata simplemente de pasar un examen más de la escuela. La evaluación busca comprobar los conocimientos correspondientes a la formación de un piloto comercial.

Por eso, prepararte únicamente memorizando preguntas puede quedarse corto. La verdadera preparación consiste en **comprender los conceptos, relacionarlos y poder aplicarlos**.

## ¿Cuándo se presenta?

Las fechas dependen de la convocatoria correspondiente. Siempre debes revisar la información oficial más reciente publicada por la AFAC.

## ¿Cómo empezar a prepararte?

Lo primero es conocer la convocatoria y la guía del sustentante correspondiente. Después puedes dividir el contenido por materias, identificar tus áreas débiles y comenzar a practicar.

No esperes a que salga la convocatoria para empezar: cuando la convocatoria se publica, el tiempo disponible para prepararte empieza a correr.

### Tip FlightPath

No estudies solamente para recordar respuestas. Estudia para poder **explicar por qué** una respuesta es correcta.

Sigue con: [¿Qué evalúa el CIAAC?](/blog/que-evalua-el-ciaac) · [Guía CIAAC](/blog/guia-ciaac)$md$,
 '2026-08-20', '2026-09-09', 'published', 5, ARRAY['CIAAC','EGE-PC'], false,
 'Prepárate para el CIAAC con FlightPath',
 'Banco de preguntas por materia, simulador y análisis de tus errores para saber exactamente qué reforzar.',
 '/ciaac'
),
(
 '¿Qué evalúa el CIAAC?',
 'que-evalua-el-ciaac',
 'Entiende qué conocimientos necesitas dominar para prepararte correctamente para el EGE-PC.',
 'CIAAC',
 '/blog/portada-ciaac.jpg',
 $md$Prepararte para el CIAAC no significa solamente aprenderte una enorme cantidad de preguntas. El objetivo es demostrar que cuentas con los conocimientos correspondientes a tu formación como piloto comercial.

Antes de preguntarte "¿cuántas preguntas tengo que estudiar?", pregúntate: **¿qué necesito realmente dominar?**

## El EGE-PC

El nombre oficial del examen es **Examen General de Egreso para Piloto Comercial (EGE-PC)**. La AFAC publica la guía correspondiente a cada convocatoria, y esa guía debe ser tu principal referencia para saber qué estudiar.

## ¿Qué conocimientos debes dominar?

La preparación puede involucrar diferentes áreas de conocimiento aeronáutico, como:

- Aerodinámica.
- Meteorología.
- Navegación.
- Reglamentación.
- Operaciones.
- Factores humanos.
- Conocimientos generales de aeronaves.
- Comunicaciones.
- Performance.
- Planeación y toma de decisiones.

El contenido exacto debe revisarse siempre en la **guía oficial de la convocatoria vigente**.

## ¿Memorizar es suficiente?

No. Puedes memorizar una respuesta y aun así no comprender el concepto. Una buena preparación debería permitirte responder preguntas diferentes sobre el mismo tema.

Cuando estudies algo, pregúntate:

- ¿Por qué ocurre?
- ¿Qué factores lo modifican?
- ¿Cómo se relaciona con otros temas?
- ¿Podría explicarlo con mis propias palabras?

## ¿Cómo saber qué necesitas reforzar?

Practica. Tus errores te dicen dónde necesitas volver a estudiar. No solamente registres cuántas preguntas acertaste; registra también:

- Qué fallaste.
- Por qué lo fallaste.
- Qué concepto estaba detrás del error.
- Si vuelves a cometer el mismo error.

La preparación empieza cuando puedes identificar exactamente qué necesitas mejorar.

Sigue con: [¿Cómo estudiar para el CIAAC?](/blog/como-estudiar-para-el-ciaac)$md$,
 '2026-08-22', '2026-09-09', 'published', 5, ARRAY['CIAAC','EGE-PC','materias'], false,
 'Prepárate para el CIAAC con FlightPath',
 'Practica por materia y revisa tus errores con explicación, no solo la respuesta correcta.',
 '/ciaac'
),
(
 '¿Cuándo sale la convocatoria CIAAC 2027?',
 'cuando-sale-la-convocatoria-ciaac-2027',
 'Conoce dónde consultar la convocatoria oficial y qué hacer mientras esperas la publicación de 2027.',
 'CIAAC',
 '/blog/portada-convocatorias.jpg',
 $md$Si estás planeando presentar el CIAAC en 2027, probablemente una de tus primeras preguntas sea: ¿cuándo sale la convocatoria?

La respuesta más importante es: **debes esperar la publicación oficial de la AFAC** para conocer las fechas definitivas.

## ¿Dónde se publica?

La información oficial relacionada con el **Examen General de Egreso para Piloto Comercial (EGE-PC)** se publica a través de la Agencia Federal de Aviación Civil. Ahí podrás consultar:

- Convocatoria.
- Fechas.
- Requisitos.
- Registro.
- Guía del sustentante.
- Instrucciones.
- Información relacionada con la evaluación.

## ¿Ya existe una fecha para 2027?

Al momento de publicar este artículo, la convocatoria 2027 debe considerarse **pendiente de publicación oficial** hasta que la AFAC comunique las fechas correspondientes.

No tomes como definitiva una fecha publicada en redes sociales, grupos de WhatsApp o páginas de terceros.

## ¿Entonces espero para estudiar?

No. Esta es probablemente la peor estrategia. Cuando se publica una convocatoria, el tiempo para prepararte comienza a correr. Si empiezas antes, puedes utilizar la convocatoria para **ajustar** tu preparación en lugar de comenzar desde cero.

## ¿Qué puedes hacer mientras esperas?

- Revisar la información oficial disponible.
- Conocer el contenido de estudio.
- Dividir el temario.
- Detectar tus áreas débiles.
- Crear una rutina.
- Practicar preguntas.
- Medir tu progreso.

Cuando aparezca la convocatoria 2027, solamente tendrás que adaptar tu plan a la información oficial.

> **Importante:** las fechas, requisitos y procedimientos pueden cambiar. Consulta siempre la convocatoria oficial vigente de la AFAC. Última actualización: septiembre de 2026.$md$,
 '2026-08-25', '2026-09-09', 'published', 4, ARRAY['CIAAC','convocatoria','2027'], false,
 'Prepárate para el CIAAC con FlightPath',
 'Empieza hoy: temario por materia, práctica medida y seguimiento de tu progreso.',
 '/ciaac'
),
(
 '¿Cómo estudiar para el CIAAC?',
 'como-estudiar-para-el-ciaac',
 'Una estrategia para dejar de estudiar a lo loco y comenzar a prepararte con intención.',
 'CIAAC',
 '/blog/portada-ciaac.jpg',
 $md$Estudiar para el CIAAC puede sentirse abrumador. Hay muchas materias, conceptos y preguntas. Pero estudiar más horas no necesariamente significa estudiar mejor. La clave está en tener un **sistema**.

## 1. Empieza por el temario

Antes de abrir cientos de preguntas, conoce qué necesitas estudiar. Utiliza la guía oficial correspondiente a la convocatoria. Divide el contenido en bloques y no intentes estudiar todo al mismo tiempo.

## 2. Descubre qué sabes

Haz una prueba inicial sin consultar tus apuntes. Responde y registra tus resultados. Después clasifica los temas:

- **Verde:** lo domino.
- **Amarillo:** lo conozco, pero todavía fallo.
- **Rojo:** necesito estudiarlo.

Esto te permite dejar de estudiar todos los temas por igual.

## 3. Estudia para entender

Cuando estudies un concepto, intenta responder:

- ¿Qué significa?
- ¿Por qué sucede?
- ¿Qué lo modifica?
- ¿Con qué otros temas se relaciona?

## 4. Practica recuperación

Cierra el libro. Explica el concepto con tus propias palabras. Después responde preguntas. Esto te permite comprobar si realmente aprendiste o simplemente reconoces la información cuando la ves.

## 5. Analiza tus errores

Un error no debería terminar cuando ves la respuesta correcta. Pregúntate **por qué te equivocaste** y regresa al concepto.

## 6. Mide tu progreso

Registra:

- Porcentaje de aciertos.
- Temas débiles.
- Preguntas repetidas incorrectamente.
- Tiempo de respuesta.
- Progreso por materia.

Así puedes reemplazar "creo que ya estoy listo" por **"tengo evidencia de que estoy mejorando"**.

### Tip FlightPath

No estudies hasta cansarte. Estudia hasta poder demostrar que dominas el tema.

Sigue con: [Reprobé el CIAAC, ¿y ahora qué?](/blog/reprobe-el-ciaac-y-ahora-que)$md$,
 '2026-08-27', '2026-09-09', 'published', 6, ARRAY['CIAAC','estudio','método'], false,
 'Prepárate para el CIAAC con FlightPath',
 'Un plan por materia, práctica con explicación y métricas reales de tu progreso.',
 '/ciaac'
),
(
 'Reprobé el CIAAC, ¿y ahora qué?',
 'reprobe-el-ciaac-y-ahora-que',
 'Reprobar no significa empezar desde cero. Aprende a utilizar tu resultado para preparar tu siguiente intento.',
 'CIAAC',
 '/blog/portada-ciaac.jpg',
 $md$Primero: respira. Reprobar un examen no significa que no puedas convertirte en un buen piloto. Significa que necesitas entender qué ocurrió y decidir qué vas a hacer diferente.

## No empieces estudiando todo otra vez

Uno de los errores más comunes después de reprobar es volver a abrir todos los libros y comenzar desde la primera página. Antes, analiza tu preparación:

- ¿Qué materias me costaron más?
- ¿Qué temas fallé?
- ¿Estudié suficiente?
- ¿Estudié de manera constante?
- ¿Me limité a memorizar preguntas?
- ¿Practiqué preguntas diferentes?
- ¿Hice simulaciones?
- ¿Podía explicar los conceptos?

## No necesariamente tienes que empezar desde cero

Ya tienes algo que antes no tenías: **experiencia real presentando el examen**. Utilízala. Identifica lo que dominas, lo que todavía confundes y lo que necesitas volver a aprender. Tu siguiente preparación debe enfocarse especialmente en los últimos dos grupos.

## Cambia tu estrategia

Si memorizaste preguntas y no funcionó, repetir exactamente lo mismo probablemente no sea la mejor estrategia. Prueba este ciclo:

**Aprender → recuperar → practicar → analizar errores → repasar → volver a practicar.**

## Revisa la convocatoria vigente

Los procesos y condiciones pueden depender de la convocatoria correspondiente. No te bases únicamente en información de grupos o publicaciones antiguas.

## No conviertas un resultado en una etiqueta

"Reprobé" describe un resultado; no describe tu capacidad como piloto. Tu siguiente intento no debería ser simplemente volver a presentar: debería ser **prepararte de una manera diferente**.

Sigue con: [¿Cómo estudiar para el CIAAC?](/blog/como-estudiar-para-el-ciaac) · [Guía CIAAC](/blog/guia-ciaac)$md$,
 '2026-08-29', '2026-09-09', 'published', 5, ARRAY['CIAAC','segundo intento'], false,
 'Prepárate para el CIAAC con FlightPath',
 'Detecta tus materias débiles con datos y arma un plan distinto para tu siguiente intento.',
 '/ciaac'
),
(
 'Guía Aeroméxico: qué revisar antes de aplicar',
 'guia-aeromexico',
 'Todo lo que necesitas saber para entender una convocatoria de Aeroméxico y prepararte para el proceso de selección.',
 'Aerolíneas',
 '/blog/portada-aerolineas.jpg',
 $md$Entrar a una aerolínea no empieza el día que aparece una convocatoria: empieza mucho antes. Esta guía te ayuda a entender qué revisar y cómo prepararte.

## 1. Revisa los requisitos

Cada convocatoria puede establecer requisitos diferentes dependiendo de la posición y la flota. Revisa siempre la **convocatoria específica**.

Más a fondo: [¿Qué requisitos necesitas para aplicar en Aeroméxico?](/blog/requisitos-para-aplicar-en-aeromexico)

## 2. Ten tu expediente listo

Mantén actualizados:

- Licencias.
- Certificados.
- Documentación académica.
- Pasaporte.
- Visa cuando corresponda.
- CV.
- Bitácora.
- Cualquier documento solicitado.

Más a fondo: [Convocatoria Aeroméxico: requisitos, documentos y proceso](/blog/convocatoria-aeromexico-requisitos-documentos-proceso)

## 3. Conoce el proceso

El proceso puede incluir: **registro → solicitud → revisión → continuación del proceso → evaluaciones**.

Más a fondo: [¿Cómo es el proceso de selección?](/blog/convocatoria-aeromexico-proceso-de-seleccion)

## 4. Prepárate para las evaluaciones

Dependiendo de la convocatoria pueden existir examen teórico, AON, inglés, simulador y panel.

Más a fondo: [¿Qué viene después de aplicar?](/blog/convocatoria-aeromexico-que-viene-despues-de-aplicar)

## 5. Estudia el material específico

Si la convocatoria proporciona una guía o temario, comienza por ahí. No estudies cientos de temas que no forman parte de la evaluación mientras descuidas los que sí.

Más a fondo: [Convocatoria Aeroméxico: ¿qué estudiar?](/blog/convocatoria-aeromexico-que-estudiar)

## 6. No esperes a que salga la convocatoria

Esta es probablemente la recomendación más importante. Cuando aparece una oportunidad, el tiempo puede ser limitado. Si ya tienes tus documentos listos, conoces tus áreas débiles y tienes una rutina de estudio, puedes dedicarte a adaptar tu preparación.

## Tu objetivo

No se trata solamente de cumplir los requisitos mínimos. Se trata de llegar a la convocatoria pensando: **"si la oportunidad aparece hoy, estoy listo para aprovecharla"**.

> Los requisitos y etapas dependen de cada convocatoria. Consulta siempre la publicación oficial vigente. Última actualización: septiembre de 2026.$md$,
 '2026-09-02', '2026-09-09', 'published', 7, ARRAY['Aeroméxico','aerolíneas','guía'], true,
 'Empieza a prepararte para tu próxima convocatoria',
 'Cuestionarios de línea aérea, inglés RTARI y pruebas de aptitud en un solo lugar.',
 '/linea-aerea'
),
(
 '¿Qué requisitos necesitas para aplicar en Aeroméxico?',
 'requisitos-para-aplicar-en-aeromexico',
 'Conoce qué revisar antes de aplicar y por qué los requisitos pueden cambiar según la convocatoria.',
 'Aerolíneas',
 '/blog/portada-aerolineas.jpg',
 $md$Si tu objetivo es entrar a Aeroméxico, una de las primeras preguntas que debes hacerte es: ¿cumplo con los requisitos de la convocatoria?

Y hay algo importante: **los requisitos pueden cambiar** dependiendo de la posición, la flota y la convocatoria. Por eso nunca debes asumir que una convocatoria anterior tendrá exactamente los mismos requisitos.

## ¿Qué debes revisar?

Antes de aplicar, revisa:

- Nacionalidad.
- Edad.
- Horas de vuelo.
- Experiencia específica.
- Licencias.
- Certificados.
- Aptitud psicofísica.
- Inglés.
- Documentación académica.
- Pasaporte y visa cuando corresponda.
- Bitácora.
- Cualquier requisito adicional de la convocatoria.

## Las horas de vuelo

Las horas requeridas pueden variar considerablemente. Por ejemplo, una convocatoria puede solicitar una cantidad de horas totales y además exigir experiencia específica en determinado tipo de aeronave.

Por eso no basta con preguntar "¿cuántas horas pide Aeroméxico?". La pregunta correcta es: **¿cuántas horas pide esta convocatoria y para esta posición?**

## Tu documentación

No esperes a que salga una convocatoria para comenzar a reunir tus documentos. Tenlos **vigentes, completos, legibles y organizados**.

## La convocatoria manda

Si encuentras información en redes sociales o en un grupo de pilotos, compárala con la publicación oficial. Los requisitos pueden cambiar.

### Tip FlightPath

La mejor preparación empieza antes de que aparezca la convocatoria. Si tus documentos están listos y conoces tus áreas débiles, puedes concentrarte en prepararte para la selección cuando llegue la oportunidad.

Sigue con: [Guía Aeroméxico](/blog/guia-aeromexico)

> Última actualización: septiembre de 2026.$md$,
 '2026-09-03', '2026-09-09', 'published', 5, ARRAY['Aeroméxico','requisitos'], false,
 'Empieza a prepararte para tu próxima convocatoria',
 'Practica el temario de línea aérea y certifica tu inglés aeronáutico con RTARI.',
 '/linea-aerea'
),
(
 'Convocatoria Aeroméxico: requisitos, documentos y proceso',
 'convocatoria-aeromexico-requisitos-documentos-proceso',
 'Una guía para entender qué revisar desde que aparece una convocatoria hasta las etapas de selección.',
 'Convocatorias',
 '/blog/portada-convocatorias.jpg',
 $md$Cuando aparece una convocatoria de Aeroméxico, es muy fácil concentrarse únicamente en las horas de vuelo. Pero una convocatoria es mucho más que eso. Necesitas entender el camino completo: **requisitos → documentos → solicitud → revisión → selección**.

## 1. Revisa los requisitos

Antes de enviar tu solicitud, confirma que cumples con cada requisito. Revisa especialmente horas, experiencia, licencias, edad, nacionalidad, certificados y documentación.

## 2. Prepara tu expediente

Dependiendo de la convocatoria, pueden solicitar documentos como:

- Licencia.
- Certificado de aptitud psicofísica.
- RTARI.
- Documentos académicos.
- Pasaporte.
- Visa.
- CV.
- Comprobante de domicilio.
- Bitácora de vuelo.

La lista exacta debe salir de la **convocatoria vigente**.

## 3. Envía tu solicitud

Una vez que confirmas que cumples los requisitos y tienes tu expediente, debes completar el proceso de registro y solicitud establecido.

## 4. Revisión

Tu expediente debe ser revisado. Enviar una solicitud no significa automáticamente que avanzarás a la siguiente etapa.

## 5. Carta

Dependiendo del proceso, puedes recibir la documentación necesaria para continuar con la selección.

## 6. Evaluaciones

Las etapas pueden variar. Una convocatoria puede incluir examen teórico, evaluación psicométrica/AON, inglés, simulador y panel. Por eso debes estudiar para la **convocatoria específica**.

## La regla más importante

La convocatoria vigente manda. No estudies para una convocatoria que existió hace un año: estudia para la que tienes enfrente.

Sigue con: [¿Qué estudiar?](/blog/convocatoria-aeromexico-que-estudiar)

> Última actualización: septiembre de 2026.$md$,
 '2026-09-04', '2026-09-09', 'published', 6, ARRAY['Aeroméxico','convocatoria','documentos'], false,
 'Empieza a prepararte para tu próxima convocatoria',
 'Arma tu preparación mientras reúnes tu expediente: temario, práctica y seguimiento.',
 '/linea-aerea'
),
(
 'Convocatoria Aeroméxico: ¿qué estudiar?',
 'convocatoria-aeromexico-que-estudiar',
 'Cómo convertir el temario de una convocatoria en un plan de estudio real.',
 'Convocatorias',
 '/blog/portada-convocatorias.jpg',
 $md$Después de ver una convocatoria probablemente aparece la pregunta: "¿qué estudio?". La respuesta comienza por el **material oficial de esa convocatoria**.

## No estudies "todo"

Uno de los errores más comunes es intentar estudiar absolutamente todo lo relacionado con aviación. Eso puede hacer que pierdas tiempo y no llegues a dominar lo que realmente será evaluado.

Comienza por: **convocatoria → temario → temas → plan de estudio**.

## Divide el contenido

Clasifica los temas:

- **Verde:** los domino.
- **Amarillo:** los conozco, pero todavía cometo errores.
- **Rojo:** necesito estudiarlos.

Después distribuye tu tiempo.

## No estudies solamente leyendo

Leer no garantiza que puedas responder. Combina **estudio → recuperación → preguntas → análisis de errores → repaso**.

## Practica con tiempo

Si existe una evaluación teórica, practica también bajo presión de tiempo. Primero busca precisión; después trabaja velocidad.

## No olvides las demás etapas

Una selección puede incluir diferentes evaluaciones además del examen teórico. Dependiendo de la convocatoria, pueden existir pruebas como AON, inglés, simulador y panel. Por eso la preparación debe contemplar todo el proceso.

### Tip FlightPath

No estudies solamente porque "ya salió convocatoria". Prepárate antes para que, cuando aparezca, puedas concentrarte en adaptar tu estudio al proceso específico.

Sigue con: [¿Cómo es el proceso de selección?](/blog/convocatoria-aeromexico-proceso-de-seleccion)

> Última actualización: septiembre de 2026.$md$,
 '2026-09-05', '2026-09-09', 'published', 5, ARRAY['Aeroméxico','estudio','convocatoria'], false,
 'Empieza a prepararte para tu próxima convocatoria',
 'Cuestionarios de línea aérea por capítulo, simulador y análisis de errores.',
 '/linea-aerea'
),
(
 'Convocatoria Aeroméxico: ¿cómo es el proceso de selección?',
 'convocatoria-aeromexico-proceso-de-seleccion',
 'Conoce las etapas que puede tener una selección de Aeroméxico y qué debes esperar de cada una.',
 'Convocatorias',
 '/blog/portada-convocatorias.jpg',
 $md$Aplicar a una convocatoria no significa que inmediatamente tendrás un examen. Normalmente existe un proceso con diferentes etapas.

## 1. Convocatoria y registro

Primero revisas los requisitos y confirmas que cumples con ellos. Después realizas el registro y envías tu solicitud.

## 2. Revisión del expediente

Se revisa tu información y documentación. Por eso es importante que el expediente esté completo y actualizado.

## 3. Carta

Una vez aprobada la documentación, el proceso continúa de acuerdo con las instrucciones de la convocatoria.

## 4. Evaluaciones

Las etapas dependen de cada convocatoria. Pueden incluir: **examen teórico → AON → inglés → simulador → panel**. No todas las convocatorias necesariamente tendrán exactamente las mismas etapas.

## 5. Simulador

El simulador permite evaluar tu desempeño en un entorno controlado. No se trata únicamente de "volar bonito": la preparación puede involucrar procedimientos, manejo de carga de trabajo y respuesta ante diferentes situaciones.

## 6. Panel

El panel representa otra etapa del proceso y puede evaluar aspectos diferentes de la parte técnica. Por eso no debes preparar toda la selección como si fuera solamente un examen escrito.

## Lo importante

No existe un proceso universal para todas las convocatorias. La convocatoria específica debe ser tu fuente principal. Revisa requisitos, documentación, temario, fechas, evaluaciones y etapas.

Sigue con: [¿Qué viene después de aplicar?](/blog/convocatoria-aeromexico-que-viene-despues-de-aplicar)

> Última actualización: septiembre de 2026.$md$,
 '2026-09-06', '2026-09-09', 'published', 5, ARRAY['Aeroméxico','selección','simulador'], false,
 'Empieza a prepararte para tu próxima convocatoria',
 'Practica el examen teórico, el inglés y las pruebas de aptitud desde una sola plataforma.',
 '/linea-aerea'
),
(
 'Convocatoria Aeroméxico: ¿qué viene después de aplicar?',
 'convocatoria-aeromexico-que-viene-despues-de-aplicar',
 'Aplicar es apenas el comienzo. Esto es lo que debes tener en cuenta después de enviar tu solicitud.',
 'Convocatorias',
 '/blog/portada-convocatorias.jpg',
 $md$Enviar tu solicitud puede sentirse como el paso más importante. Pero en realidad es apenas el comienzo.

## 1. Revisión de tu expediente

Después de enviar la solicitud, tu información y documentación deben ser revisadas. Por eso es importante asegurarte de que todo esté completo antes de enviar.

## 2. Continuación del proceso

Si cumples con los requisitos y tu expediente es aprobado, recibirás las instrucciones correspondientes para continuar.

## 3. Prepárate para las evaluaciones

Dependiendo de la convocatoria, pueden existir diferentes etapas: examen teórico, AON, inglés, simulador y panel. No todas las convocatorias necesariamente tendrán las mismas evaluaciones.

## 4. No empieces a estudiar cuando ya aplicaste

Esta es una de las principales razones por las que conviene prepararte desde antes. Cuando aparece una convocatoria, el tiempo disponible puede ser limitado. Si ya conoces tus áreas débiles, tienes una rutina y tus documentos están listos, puedes concentrarte en adaptar tu preparación.

## 5. Mantente atento

Las convocatorias tienen fechas específicas. Revisa constantemente las fuentes oficiales y cualquier comunicación relacionada con tu proceso.

## ¿Y si no avanzas?

No significa que tu preparación haya sido inútil. Analiza qué etapa presentaste, qué te faltó y qué puedes mejorar. Una selección también puede enseñarte cómo es el proceso en la práctica.

## Recuerda

Aplicar no es la meta. La meta es **estar preparado cuando llegue la oportunidad**.

Sigue con: [Guía Aeroméxico](/blog/guia-aeromexico)

> Última actualización: septiembre de 2026.$md$,
 '2026-09-07', '2026-09-09', 'published', 5, ARRAY['Aeroméxico','convocatoria'], false,
 'Empieza a prepararte para tu próxima convocatoria',
 'Mientras avanza tu proceso, mantén tu preparación medida y constante.',
 '/linea-aerea'
);