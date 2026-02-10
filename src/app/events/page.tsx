import { PublicEventsView } from '@/components/views/PublicEventsView';

export const metadata = {
  title: 'Public Events',
};

export default function PublicEventsPage() {
  return (
    <main className="min-h-screen bg-grid-pattern text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <PublicEventsView />
      </div>
    </main>
  );
}

