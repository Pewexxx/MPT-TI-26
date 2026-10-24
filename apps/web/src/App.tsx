import { useQuery } from '@tanstack/react-query';
import { discountPercent, type Offer } from '@promo/shared';

export function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: async (): Promise<{ items: Offer[] }> => {
      const res = await fetch('/api/offers');
      if (!res.ok) throw new Error(`API error ${res.status}`);
      return res.json();
    },
  });

  if (isLoading) return <p>Ładowanie…</p>;
  if (error) return <p>Błąd: {String(error)}</p>;

  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1>Promki dla studenta</h1>
      <ul>
        {data?.items.map((o) => (
          <li key={o.id}>
            [{o.store}] {o.name} — {o.pricePromo.toFixed(2)} zł
            {discountPercent(o) !== null && ` (-${discountPercent(o)}%)`}
          </li>
        ))}
      </ul>
    </main>
  );
}
