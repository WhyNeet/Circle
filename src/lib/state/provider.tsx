import { createResource, createSignal, JSXElement } from "solid-js";
import { AppContext } from ".";
import { AppData } from "../app-data";
import { FileTreeRef } from "../../components/file-tree";

export function AppContextProvider(props: { children: JSXElement }) {
  const [appData] = createResource(AppData.load);
  const [fileTreeRef, setFileTreeRef] = createSignal<FileTreeRef | null>(null);
  const [currentSpace, setCurrentSpace] = createSignal(1);

  return <AppContext.Provider value={{ appData, currentSpace, setCurrentSpace, fileTreeRef, setFileTreeRef }}>
    {appData.loading ? null : props.children}
  </AppContext.Provider>
}
