import { initTheme } from "./theme";
import { SystemMenu } from "./menu";
import { RouteSectionProps } from "@solidjs/router";

export async function init() {
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  initTheme();

}

export function AppLayout(props: RouteSectionProps<unknown>) {
  init();

  return <>
    <SystemMenu />
    {props.children}
  </>;
}
