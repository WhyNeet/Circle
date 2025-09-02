import { createResource, createSignal, JSXElement } from "solid-js";
import { AppContext } from ".";
import { AppData } from "../app-data";

export function AppContextProvider(props: { children: JSXElement }) {
  const [appData] = createResource(AppData.load);
  const [currentSpace, setCurrentSpace] = createSignal(1);

  return <AppContext.Provider value={{ appData, currentSpace, setCurrentSpace }}>
    {appData.loading ? null : props.children}
  </AppContext.Provider>
}
