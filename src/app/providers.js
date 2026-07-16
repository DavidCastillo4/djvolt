'use client';

import { Provider, createStore } from 'jotai';

const store = createStore();

export function Providers({ children }) {
 return <Provider store={store}>{children}</Provider>;
}
