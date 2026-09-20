# Recursos del rediseño

Los archivos con nombres hash son imágenes y fuentes embebidas en el HTML de diseño proporcionado por el usuario. Sus nombres se mantienen estables para evitar duplicados. El HTML fuente no se publica.

Las texturas earth-day.jpg y earth-night.png son las texturas de la Tierra de los ejemplos de Three.js (mrdoob/three.js, examples/textures/planets), usadas como reemplazo local de las referencias blob externas no incluidas en el HTML. La implementación del globo usa WebGL directamente, sin agregar Three.js como dependencia.

El arte y las fuentes se sirven desde este directorio: no dependen del exportador del diseño ni de peticiones de fuentes de terceros.
