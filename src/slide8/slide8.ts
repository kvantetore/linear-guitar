import { AudioNodeWrapper } from "../effect/AudioNodeWrapper";
import { OverdriveNode } from "../effect/OverdriveNode";
import { ReverbNode } from "../effect/ReverbNode";
import { Guitar } from "../guitar/guitar";
import { addSong1, addSong2 } from "../music";
import { addGamepadBindings, addGamepadInfo } from "../tools/gamepad";
import { createRegularGrid } from "../tools/grid";
import { addHeader } from "../tools/math";
import { addButton, addGuitarKeyboardInput } from "../tools/ui";

export async function slide8() {
    let grid = createRegularGrid(0, 1, 128);
    let audioCtx = new AudioContext({
        sampleRate: 22000
    });
    await audioCtx.audioWorklet.addModule("js/guitar/string-node.js");

    addHeader("A Linear Guitar");

    let guitar = new Guitar(audioCtx, grid);
    guitar.animate();

    var guitarNode = new AudioNodeWrapper(audioCtx, guitar.volumeNode);
    var overdrive = new OverdriveNode(audioCtx);
    var reverb = new ReverbNode(audioCtx);

    guitarNode
        .connect(overdrive)
        .connect(reverb)
        .connect(audioCtx.destination);


    addGamepadBindings(guitar, overdrive, reverb);
    addGuitarKeyboardInput(guitar);

    addButton("Resume", () => audioCtx.resume());
    addSong1(guitar);

}