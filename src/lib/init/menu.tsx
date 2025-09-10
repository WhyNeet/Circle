import { useNavigate } from "@solidjs/router";
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from "@tauri-apps/api/menu";

export function SystemMenu() {
  const navigate = useNavigate();

  const init = async () => {
    const aboutSubmenu = await Submenu.new({
      text: "About",
      items: [
        await MenuItem.new({
          text: "About circle",
          action: () => console.log("circle"),
        }),
        await PredefinedMenuItem.new({
          item: "Separator",
        }),
        await PredefinedMenuItem.new({
          item: "Services",
        }),
        await PredefinedMenuItem.new({
          item: "Separator",
        }),
        await PredefinedMenuItem.new({
          item: "Hide",
        }),
        await PredefinedMenuItem.new({
          item: "HideOthers",
        }),
        await PredefinedMenuItem.new({
          item: "Separator",
        }),
        await PredefinedMenuItem.new({
          item: "Quit",
          text: "Quit circle",
        }),
      ],
    });

    const fileSubmenu = await Submenu.new({
      text: "File",
      items: [
        await MenuItem.new({
          id: "new-file",
          text: "New Note",
          accelerator: "Cmd+N",
        }),
      ],
    });

    const editSubmenu = await Submenu.new({
      text: "Edit",
      items: [
        await PredefinedMenuItem.new({
          item: "Undo",
        }),
        await PredefinedMenuItem.new({
          item: "Redo",
        }),
        await PredefinedMenuItem.new({
          item: "Separator",
        }),
        await PredefinedMenuItem.new({
          item: "Cut",
        }),
        await PredefinedMenuItem.new({
          item: "Copy",
        }),
        await PredefinedMenuItem.new({
          item: "Paste",
        }),
        await PredefinedMenuItem.new({
          item: "SelectAll",
        }),
      ],
    });

    const viewSubmenu = await Submenu.new({
      text: "View",
      items: [
        await PredefinedMenuItem.new({
          item: "Fullscreen",
        }),
      ],
    });

    const windowSubmenu = await Submenu.new({
      text: "Window",
      items: [
        await PredefinedMenuItem.new({
          item: "Minimize",
        }),
      ],
    });

    const spacesSubmenu = await Submenu.new({
      text: "Spaces",
      items: [
        await MenuItem.new({
          id: "new-space",
          text: "New Space",
          action: () => navigate("/new-space"),
        }),
      ],
    });

    const menu = await Menu.new({
      items: [
        aboutSubmenu,
        fileSubmenu,
        editSubmenu,
        viewSubmenu,
        windowSubmenu,
        spacesSubmenu,
      ],
    });

    await menu.setAsAppMenu();
  };

  init();

  return null;
}
