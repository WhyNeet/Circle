import { createResource, createSignal } from "solid-js";
import PanelRightIcon from "lucide-solid/icons/panel-right";
import { RouteSectionProps } from "@solidjs/router";
import { Sidebar } from "./components/sidebar";
import { useAppContext } from "./lib/state";

export default function Layout(props: RouteSectionProps<unknown>) {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const { currentSpace, appData } = useAppContext();
  const [currentSpaceData] = createResource(currentSpace, appData()!.getSpaceById.bind(appData()));

  return <main class="flex h-screen w-screen relative">
    <header class="h-[52px] fixed top-0 inset-x-0 flex items-center pl-5 pr-2 justify-between z-50 pointer-events-none">
      <div class="flex items-center gap-4">
        <button class="pointer-events-auto cursor-pointer relative after:-z-10 after:absolute after:-inset-1 after:rounded-md hover:after:bg-base-content/5 text-neutral-500 active:after:bg-base-content/10 active:brightness-150" onClick={() => setSidebarOpen(prev => !prev)}>
          <PanelRightIcon class="h-5 w-5 rotate-180" />
        </button>
        <div class="text-sm font-bold text-base-content">{currentSpaceData()?.name}</div>
      </div>
    </header>
    <Sidebar isOpen={sidebarOpen()} currentSpace={currentSpaceData} />
    <div class="h-screen flex-1 relative">
      {props.children}
    </div>
  </main>
}
