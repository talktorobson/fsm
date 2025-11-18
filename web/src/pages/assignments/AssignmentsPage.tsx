/**
 * Assignments Page
 * Provider assignment management interface
 * TODO: Implement full assignment workflow
 */

export default function AssignmentsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-1">Manage provider assignments</p>
      </div>

      <div className="card">
        <p className="text-gray-600">
          Assignment interface coming soon. This will include:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>Search and filter providers</li>
          <li>Provider scoring transparency</li>
          <li>Direct assignment workflow</li>
          <li>Offer-based assignment</li>
          <li>Broadcast assignments</li>
          <li>Assignment history and audit trail</li>
          <li>Provider acceptance/refusal tracking</li>
        </ul>
      </div>
    </div>
  );
}
