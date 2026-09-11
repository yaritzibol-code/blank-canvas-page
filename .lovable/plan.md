# Aviso de mantenimiento visible también para administración

Ahora mismo el aviso de "En mantenimiento" sí está puesto en Learning Paths y Estudiemos Juntos, pero las cuentas de administración lo saltan por completo, así que tú entras directo al módulo y no lo ves.

## Qué se cambia

- El aviso se muestra a todo el mundo, incluida tu cuenta: es lo primero que aparece al entrar a Learning Paths o a Estudiemos Juntos.
- Debajo del botón "Entendido" aparece, solo para cuentas de administración, un enlace discreto tipo "Entrar de todos modos (admin)". Al tocarlo, se abre el módulo completo como siempre.
- Ese acceso se recuerda mientras dure la sesión en ese navegador, para que no tengas que tocarlo en cada pantalla que visites dentro de Learning Paths.
- Las alumnas nunca ven ese enlace.

## Lo que no se toca

Nada de contenido, progreso, cuestionarios, flashcards, Pathy, sesiones, B737 ni datos de usuarias. Los dos interruptores siguen funcionando igual: al ponerlos en apagado, ambas funciones vuelven a estar disponibles para todos sin reconstruir nada.

## Detalle técnico

- `src/components/shared/Maintenance.tsx`: `maintenanceGate` deja de excluir a `role === "admin"`. En su lugar, el componente `Maintenance` recibe la opción de mostrar el enlace de bypass cuando el usuario es admin, y ese enlace guarda una marca en `sessionStorage` (`fp_maint_bypass`) más estado local para re-render inmediato.
- `src/routes/dashboard/rutas.tsx` y `src/routes/dashboard/estudiemos.tsx`: sin cambios de estructura; siguen envueltos por `maintenanceGate` con los mismos textos. El `adminOnly` existente de Learning Paths se conserva intacto.
- `src/lib/feature-flags.ts` se queda igual (`learningPathsMaintenance`, `studyTogetherMaintenance`).
- Verificación: typecheck, build y una revisión en el navegador con sesión real de que el aviso aparece y de que el enlace de admin abre el módulo.
