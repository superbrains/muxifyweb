declare module "*.svg" {
  import * as React from "react";

  // 👇 Add this line to tell TypeScript about the `ReactComponent` export
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  // 👇 Default export is still the SVG URL (if you use import logo from "./logo.svg")
  const src: string;
  export default src;
}
