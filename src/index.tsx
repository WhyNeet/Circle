/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import "@fontsource-variable/geist-mono";
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/crimson-text';

import Root from "./Root";
import { init } from "./lib/init";

init();

render(() => <Root />, document.getElementById("root") as HTMLElement);
