use chip8_core::*;
use wasm_bindgen::prelude::*;
use web_sys::KeyboardEvent;
use js_sys::Uint8Array;

// Tells the compiler that this struct needs to be configured for WebAssembly
#[wasm_bindgen]
pub struct EmuWasm {
    chip8: Emu,
}

#[wasm_bindgen]
impl EmuWasm {
    #[wasm_bindgen(constructor)]
    pub fn new() -> EmuWasm {
        EmuWasm {
            chip8: Emu::new(),
        }
    }

    #[wasm_bindgen]
    pub fn tick(&mut self) {
        self.chip8.tick();
    }

    #[wasm_bindgen]
    pub fn tick_timers(&mut self) {
        self.chip8.tick_timers();
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.chip8.reset();
    }

    #[wasm_bindgen]
    pub fn keypress(&mut self, evt: KeyboardEvent, pressed: bool) {
        let key = evt.key();
        if let Some(k) = key2btn(&key) {
            self.chip8.keypress(k, pressed);
        }
    }

    #[wasm_bindgen]
    pub fn load_game(&mut self, data: Uint8Array) {
        self.chip8.load(&data.to_vec());
    }

    #[wasm_bindgen]
    pub fn draw_screen(&mut self, scale: usize) {
        // TODO
    }
}

fn key2btn(key: &str) -> Option<usize> {
    match key {
        "1" => Some(0x1),
        "2" => Some(0x2),
        "3" => Some(0x3),
        "4" => Some(0xC),
        "q" => Some(0x4),
        "w" => Some(0x5),
        "e" => Some(0x6),
        "r" => Some(0xD),
        "a" => Some(0x7),
        "s" => Some(0x8),
        "d" => Some(0x9),
        "f" => Some(0xE),
        "z" => Some(0xA),
        "x" => Some(0x0),
        "c" => Some(0xB),
        "v" => Some(0xF),
        _ => None,
    }
}