import { createEffect } from "solid-js";
import { useAppContext } from "../lib/state"
import { useNavigate } from "@solidjs/router";

export default function Index() {
  const navigate = useNavigate();
  const { appData } = useAppContext();

  createEffect(() => {
    if (!appData()) return;

    appData()!.getSpaces().then((spaces) => {
      if (!spaces.length) navigate("/new-space");
      else navigate("/app");
    });
  });

  return <main class="flex items-center justify-center h-screen w-screen flex-col gap-4 cursor-default bg-base-200" data-tauri-drag-region>
    <div class="h-6 w-6 rounded-full border border-base-content/30 border-dashed animate-spin"></div>
  </main>
}
