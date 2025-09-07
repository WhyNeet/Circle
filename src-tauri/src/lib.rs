use tauri::{
    window::{Effect, EffectsBuilder},
    LogicalPosition, TitleBarStyle, WebviewUrl, WebviewWindowBuilder,
};

pub mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:app.db", db::migrations())
                .build(),
        )
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Circle")
                .inner_size(950.0, 650.0);

            let win_builder = win_builder
                .title_bar_style(TitleBarStyle::Overlay)
                .hidden_title(true)
                .decorations(true)
                .transparent(true)
                .effects(
                    EffectsBuilder::new()
                        .effects(vec![Effect::Titlebar, Effect::HudWindow])
                        .build(),
                )
                .traffic_light_position(LogicalPosition::new(-100, -100));

            win_builder.build().unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
