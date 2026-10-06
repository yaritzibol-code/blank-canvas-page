/** Only the external report workflow is replaced; lesson UI remains native. */
export function ReportProblemModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="review-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Reportes desactivados en revisión"
    >
      <div>
        <h2>Revisión local: no se envían reportes</h2>
        <p>
          Anota el código AM, la etapa y lo que observaste para compartirlo con quien te dio este
          paquete.
        </p>
        <p>Este control no guarda ni envía información.</p>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
