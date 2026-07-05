export function getDisplayName(id: string): string {
  const names: Record<string, string> = {
    bubble: 'Bubble Sort', selection: 'Selection Sort', insertion: 'Insertion Sort',
    shell: 'Shell Sort', quick: 'Quick Sort', merge: 'Merge Sort',
    heap: 'Heap Sort', tim: 'Tim Sort', cocktail: 'Cocktail Sort',
    comb: 'Comb Sort', gnome: 'Gnome Sort', counting: 'Counting Sort',
    radix: 'Radix Sort', bucket: 'Bucket Sort', bogo: 'Bogo Sort', custom: 'Custom',
  };
  return names[id] || id;
}

export const STABLE_ALGOS = new Set(['bubble','insertion','merge','tim','cocktail','gnome','counting','radix','bucket']);

export function isStable(id: string): boolean {
  return STABLE_ALGOS.has(id);
}

export function getComplexity(id: string): string {
  const c: Record<string, string> = {
    bubble: 'O(n²)', selection: 'O(n²)', insertion: 'O(n²)', shell: 'O(n log² n)',
    quick: 'O(n log n)', merge: 'O(n log n)', heap: 'O(n log n)', tim: 'O(n log n)',
    cocktail: 'O(n²)', comb: 'O(n²)', gnome: 'O(n²)',
    counting: 'O(n + k)', radix: 'O(nk)', bucket: 'O(n + k)', bogo: 'O((n+1)!)',
    custom: '—',
  };
  return c[id] || '—';
}
