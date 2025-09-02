use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_spaces_table",
        sql: include_str!("../../migrations/0000_spaces_setup.sql"),
        kind: MigrationKind::Up,
    }]
}
