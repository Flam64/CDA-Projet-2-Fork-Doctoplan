import { ReactNode, useEffect, useRef } from 'react';
import searchIcon from '@/assets/search-icon.svg';

export type SearchSource<T> = {
  name: string;
  items: T[];
  loading: boolean;
  error?: Error | string | null;
  getKey: (item: T) => string | number;
};

type SearchBarProps<T> = {
  placeholder: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sources: SearchSource<T>[];
  /**
   * Fonction à appeler lorsqu’un item est sélectionné (pour personnaliser l’action).
   * Si non fourni, le comportement par défaut est de fermer la searchBar et vider la query.
   */
  onSelect?: () => void;
  children: (item: T, source: SearchSource<T>, onSelect: () => void) => ReactNode;
};

export default function SearchBar<T>({
  placeholder,
  searchQuery,
  setSearchQuery,
  isOpen,
  setIsOpen,
  sources,
  onSelect,
  children,
}: SearchBarProps<T>) {
  const clickOutsideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clickOutsideRef.current && !clickOutsideRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen, setSearchQuery]);

  const shouldSearch = searchQuery.length >= 2;

  return (
    <div ref={clickOutsideRef} className="relative w-full ml-auto">
      <input
        type="text"
        value={searchQuery}
        onChange={e => {
          setSearchQuery(e.target.value);
          setIsOpen(true);
        }}
        placeholder={placeholder}
        className="w-full rounded-full border border-borderColor bg-white pl-4 pr-10 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <img
        src={searchIcon}
        alt="Rechercher"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 pointer-events-none"
      />

      {shouldSearch && isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-80 overflow-y-auto">
          {sources.map(source => (
            <div key={source.name}>
              <h4 className="px-2 py-1 text-xs font-semibold text-gray-500">{source.name}</h4>
              {source.loading && <p className="px-2 text-sm text-gray-500">Chargement...</p>}
              {source.error && (
                <p className="px-2 text-sm text-red-500">
                  {source.error instanceof Error ? source.error.message : String(source.error)}
                </p>
              )}
              {!source.loading && source.items.length === 0 && (
                <p className="px-2 text-sm text-gray-500">Aucun résultat trouvé.</p>
              )}
              <ul>
                {source.items.map(item => (
                  <li key={source.getKey(item)}>
                    {children(item, source, () => {
                      if (typeof onSelect === 'function') {
                        onSelect();
                      } else {
                        setSearchQuery('');
                        setIsOpen(false);
                      }
                    })}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
