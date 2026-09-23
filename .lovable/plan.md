# Responsiveness, carga y globo en alta calidad

## Objetivo
Mejorar de forma importante la adaptación a teléfono, iPad y escritorio, reducir el tiempo de carga percibido y aumentar al máximo razonable la nitidez del globo, sin cambiar el diseño visual existente.

## Cambios
- Auditar y corregir únicamente desbordes, anchos rígidos, alturas y filas que se comprimen en los puntos de quiebre actuales.
- Mantener exactamente la paleta, tipografías, componentes, jerarquía y apariencia vigente.
- Dar prioridad de carga solo al contenido visible inicialmente; diferir imágenes y animaciones que están debajo del primer bloque.
- Evitar descargas duplicadas y trabajo de animación fuera de pantalla.
- Elevar la resolución real de los canvas del globo según la densidad de cada pantalla, con límites adaptativos para conservar fluidez.
- Mejorar el filtrado de texturas y usar mipmaps/anistropía cuando el dispositivo lo soporte.
- Mantener una imagen estable mientras WebGL y las texturas terminan de cargar, evitando desapariciones o parpadeos.
- Ajustar la calidad según capacidad del equipo: máxima en pantallas Retina/escritorio y alta pero eficiente en móviles.

## Verificación
- Revisar portada, dashboard y cuestionarios en 360 px, teléfono grande, iPad y escritorio.
- Confirmar que no existan desbordes horizontales, elementos cortados ni saltos de tamaño.
- Comparar visualmente la nitidez del globo y comprobar que permanece visible durante su carga.
- Confirmar tiempos y prioridades de imágenes en red, interacciones principales y ausencia de errores.
