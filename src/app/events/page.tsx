import { PublicEventsView } from '@/components/views/PublicEventsView';

export const metadata = {
  title: 'Public Events',
};

export default function PublicEventsPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <PublicEventsView />
      </div>
    </main>
  );
}

