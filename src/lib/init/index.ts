import { getCurrentWindow } from "@tauri-apps/api/window";
import { initTheme } from "./theme";
// import { Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu";

export async function init() {
  document.addEventListener('keydown', async (e) => {
    if (e.metaKey && e.key === 'm') {
      e.preventDefault();
      await getCurrentWindow().minimize();
    }
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  initTheme();

  // const aboutSubmenu = await Submenu.new({
  //   text: "About",
  //   items: [
  //     await PredefinedMenuItem.new({
  //       text: 'Quit',
  //       item: 'Quit',
  //     }),
  //   ],
  // });

  // const fileSubmenu = await Submenu.new({
  //   text: "File",
  //   items: [
  //     await MenuItem.new({
  //       id: "new-file",
  //       text: "New Note",
  //       accelerator: "Cmd+N"
  //     }),
  //   ]
  // });

  // const spacesSubmenu = await Submenu.new({
  //   text: "Spaces",
  //   items: [
  //     await MenuItem.new({
  //       id: "new-space",
  //       text: "New",
  //     }),
  //   ]
  // });

  // const menu = await Menu.new({
  //   items: [aboutSubmenu, fileSubmenu, spacesSubmenu],
  // });

  // menu.setAsAppMenu();

}
