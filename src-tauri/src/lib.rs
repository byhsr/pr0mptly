


mod commands;
use fastembed::{TextEmbedding};
use std::sync::Mutex;

pub struct EmbeddingState(pub Mutex<Option<TextEmbedding>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
   tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(
     tauri_plugin_log::Builder::new()
    .level(log::LevelFilter::Info)
    .target(tauri_plugin_log::Target::new(
      tauri_plugin_log::TargetKind::Stdout,
    ))
    .build()
).manage(EmbeddingState(Mutex::new(None))) 
    .invoke_handler(tauri::generate_handler!
        [commands::embeddings::setup_embeddings, 
        commands::embeddings::generate_embeddings,
         commands::embeddings::search_similar, ])
    .run(tauri::generate_context!())
    .expect("error while running pr0mptly");
}
