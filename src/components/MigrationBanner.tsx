import { useEffect, useState } from 'react';

export function MigrationBanner({ isAdmin }: { isAdmin: boolean }) {
  const [unapplied, setUnapplied] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/migration-status')
      .then(res => res.json())
      .then(data => setUnapplied(data.unapplied || []));
  }, [isAdmin]);

  if (!isAdmin || !unapplied || unapplied.length === 0) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-center font-semibold">
      Warning: The following migrations have not been applied: {unapplied.join(', ')}
    </div>
  );
}
