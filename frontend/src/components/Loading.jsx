// Simple reusable loading spinner shown while API calls are in flight.
export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-muted py-4">
      <div className="spinner-border spinner-border-sm" role="status" />
      <span>{label}</span>
    </div>
  );
}
