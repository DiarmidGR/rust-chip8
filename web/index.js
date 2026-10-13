import init, * as wasm from "./wasm.js"

const WIDTH = 64
const HEIGHT = 32
const SCALE = 15
const TICKS_PER_FRAME = 10
let anim_frame = 0

const canvas = document.getElementById("canvas")
canvas.width = WIDTH * SCALE
canvas.height = HEIGHT * SCALE

const ctx = canvas.getContext("2d")
ctx.fillStyle = "black"
ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE)

const romSelect = document.getElementById("romselect")

// ROMs available in the sibling `roms/` directory
const ROMS = [
    "15PUZZLE",
    "BLINKY",
    "BLITZ",
    "BRIX",
    "CONNECT4",
    "GUESS",
    "HIDDEN",
    "INVADERS",
    "KALEID",
    "MAZE",
    "MERLIN",
    "MISSILE",
    "PONG",
    "PONG2",
    "PUZZLE",
    "SYZYGY",
    "TANK",
    "TETRIS",
    "TICTAC",
    "UFO",
    "VBRIX",
    "VERS",
    "WIPEOFF"
]

async function run () {
    await init()
    let chip8 = new wasm.EmuWasm()

    document.addEventListener("keydown", function(evt) {
        chip8.keypress(evt, true)
    })

    document.addEventListener("keyup", function(evt) {
        chip8.keypress(evt, false)
    })

    // Prevent accidental key press from changing selected rom
    document.getElementById('romselect').addEventListener('keydown', function (e) {
        e.preventDefault();
    })

    // Get selected Rom from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedRom = urlParams.get('rom');
    console.log("URL rom param: " + selectedRom);

    // Populate the dropdown with all available ROMs
    const defaultOption = document.createElement("option")
    defaultOption.textContent = "Select a game"
    defaultOption.value = ""
    romSelect.appendChild(defaultOption)

    // Populate all ROM options
    for (const rom of ROMS) {
        const option = document.createElement("option")
        option.textContent = rom
        option.value = rom
        romSelect.appendChild(option)
    }

    // Now that options exist, select the one matching URL param
    if (selectedRom) {
        romSelect.value = selectedRom
    }

    // Initialize rom provided in URL, if available
    if (selectedRom) {
        // Load the ROM from the roms directory, send to .wasm, start main loop
        loadRom(selectedRom)
    }
    showcontrols(selectedRom)

    romSelect.addEventListener("change", function (evt) {
        // Stop previous game from rendering, if there is one
        if (anim_frame != 0) {
            window.cancelAnimationFrame(anim_frame)
        }

        const romName = evt.target.value
        if (!romName) {
            return
        }

        // Update window URL to reflect loaded rom
        window.history.pushState({}, '', `?rom=${romName}`);

        // Load the ROM from the roms directory, send to .wasm, start main loop
        loadRom(romName)
        showcontrols(romName)
    }, false)


    function mainloop(chip8) {
        // Only draw every few ticks
        for (let i = 0; i < TICKS_PER_FRAME; i++) {
            chip8.tick()
        }
        chip8.tick_timers()

        // Clear the canvas before drawing
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE)
        // Set the draw colour back to white before we render our frame
        ctx.fillStyle = "white"
        chip8.draw_screen(SCALE)
        
        anim_frame = window.requestAnimationFrame(() => {
            mainloop(chip8)
        })
    }

    // changes control scheme shown below the canvas
    function showcontrols(rom) {
        const controls = document.getElementById("controls")
        // Iterate through our controls element children to hide their display
        for (const child of controls.children) {
            child.style.display = "none"
        }
        const gameScheme = document.getElementById(rom)
        switch (rom) {
            case "INVADERS":
                gameScheme.style.display = "flex"
                controls.style.display = "flex"
                break
            case "PONG":
                gameScheme.style.display = "flex"
                controls.style.display = "flex"
                break
            case "TETRIS":
                gameScheme.style.display = "flex"
                controls.style.display = "flex"
                break
            default:
                controls.style.display = "none"
                break
        }
    }

    // Load the ROM from the roms directory, send to .wasm, start main loop
    function loadRom(romName) {
        fetch(`roms/${romName}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to load ROM: ${romName}`)
                }
                return res.arrayBuffer()
            })
            .then(buffer => {
                const rom = new Uint8Array(buffer)
                chip8.reset()
                chip8.load_game(rom)
                mainloop(chip8)
            })
            .catch(err => {
                console.error(err)
                alert(err.message)
            }
        )
    }
}
run().catch(console.error)