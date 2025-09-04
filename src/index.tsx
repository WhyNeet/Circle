/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import "@fontsource-variable/geist-mono";
import Root from "./Root";
import { init } from "./lib";

init();

render(() => <Root />, document.getElementById("root") as HTMLElement);
