import { createContext, useContext, useState } from 'react';
import Spinner from './ui/Spinner';

const LoaderContext = createContext({
  show: () => {},
  hide: () => {},
});

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const show = () => setLoading(true);
  const hide = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ show, hide }}>
      {children}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-500/30 z-50">
          <Spinner />
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  return useContext(LoaderContext);
}