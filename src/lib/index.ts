import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export async function init() {
  await (async () => {
    const window = getCurrentWindow();
    const oldSize = await window.outerSize();
    const newSize = new LogicalSize(oldSize.width, oldSize.height + 1);
    await window.setSize(newSize);
    await window.setSize(oldSize);
  })();

  document.addEventListener('keydown', async (e) => {
    if (e.metaKey && e.key === 'm') {
      e.preventDefault();
      await getCurrentWindow().minimize();
    }
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());
}
