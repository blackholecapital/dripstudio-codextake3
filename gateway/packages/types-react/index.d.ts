declare namespace React {
  type ReactNode = unknown;
  interface Attributes {
    key?: string | number;
  }
}

declare module 'react' {
  export = React;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
