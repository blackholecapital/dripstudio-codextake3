export as namespace React;

export type Key = string | number;
export type ReactNode = unknown;
export type ComponentType<P = {}> = (props: P) => any;
export type PropsWithChildren<P = {}> = P & { children?: ReactNode };

export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;

declare global {
  namespace React {
    type ReactNode = unknown;
    type ComponentType<P = {}> = (props: P) => any;
  }

  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react' {
  export = React;
}
