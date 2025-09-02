import { Accessor, createContext, Resource, Setter, useContext } from "solid-js";
import { AppData } from "../app-data";

export interface Space {
  id: number;
  name: string;
  path: string;
  color: string;
}

export const AppContext = createContext<{ appData: Resource<AppData>, currentSpace: Accessor<number>, setCurrentSpace: Setter<number> }>();
export const useAppContext = () => useContext(AppContext)!;
