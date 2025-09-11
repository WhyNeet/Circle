import {
  Accessor,
  createContext,
  Resource,
  Setter,
  useContext,
} from "solid-js";
import { AppData } from "../app-data";
import { FileTreeRef } from "../../components/file-tree";

export interface Space {
  id: number;
  name: string;
  path: string;
  color: string;
}

export const AppContext = createContext<{
  appData: Resource<AppData>;
  currentSpace: Accessor<number>;
  setCurrentSpace: Setter<number>;
  setFileTreeRef: Setter<FileTreeRef | null>;
  fileTreeRef: Accessor<FileTreeRef | null>;
}>();
export const useAppContext = () => useContext(AppContext)!;
