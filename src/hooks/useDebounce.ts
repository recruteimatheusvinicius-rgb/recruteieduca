import { useEffect, useState } from 'react';

/**
 * Devolve o valor após `delay` ms sem mudanças. Útil para inputs de busca
 * em listas grandes — filtra apenas após o usuário parar de digitar.
 *
 * Exemplo:
 *   const [q, setQ] = useState('');
 *   const debounced = useDebounce(q, 250);
 *   const filtered = useMemo(() => list.filter(x => x.includes(debounced)), [list, debounced]);
 */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
