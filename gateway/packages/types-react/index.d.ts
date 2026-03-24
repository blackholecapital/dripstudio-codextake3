declare namespace React {
  type ReactNode = unknown;
  type ComponentType<P = {}> = (props: P) => any;
  type PropsWithChildren<P = {}> = P & { children?: ReactNode };

  function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
  function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type ComponentType<P = {}> = React.ComponentType<P>;
  export type PropsWithChildren<P = {}> = React.PropsWithChildren<P>;
  export const useState: typeof React.useState;
  export const useMemo: typeof React.useMemo;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}


declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
