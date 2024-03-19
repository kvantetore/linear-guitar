import { OverdriveNode } from "../effect/OverdriveNode";
import { ReverbNode } from "../effect/ReverbNode";
import { Guitar } from "../guitar/guitar";
import { playEighth } from "../music";
import { addPopup } from "./ui";

export function addGamepadInfo() {
    window.addEventListener("gamepadconnected", () => {
        console.log("Gamepad connected!");
        var gamepad = navigator.getGamepads()[0];
        addGamepadInfoImpl(gamepad);
    });
    
    window.addEventListener("gamepaddisconnected", () => {
        console.log("Gamepad disconnected!");
    });
}

function addGamepadInfoImpl(gamepad: Gamepad)
{
    var container = document.createElement("div");
    document.body.append(container);

    var axesInfos = gamepad.axes.map((a, i) => {
        var e = document.createElement("div");
        container.append(e);
        return e;
    });

    var buttonInfos = gamepad.buttons.map((b, i) => {
        var e = document.createElement("div");
        container.append(e);
        return e;
    })

    function updateGamepadInfo() {
        gamepad.axes.forEach((a, i) => {
            axesInfos[i].innerText = `axis ${i}: ${a}`;
        });

        gamepad.buttons.forEach((b, i) => {
            buttonInfos[i].innerText = `button ${i}: ${b.value}`;
        });
    }

    

    setInterval(updateGamepadInfo, 10);
}

export function addGamepadBindings(guitar, overdrive: OverdriveNode = null, reverb: ReverbNode = null) {
    window.addEventListener("gamepadconnected", ev => {
        addGamepadGuitarBindings(ev.gamepad, guitar, overdrive, reverb);
    });
}

function addGamepadGuitarBindings(gamepad: Gamepad,  guitar: Guitar, overdrive: OverdriveNode = null, reverb: ReverbNode = null)
{
    var axisState = gamepad.axes.map(a => a);
    var buttonState = gamepad.buttons.map(b => b.value);

    function isAxisChanged(idx) {
        return gamepad.axes[idx] != axisState[idx];
    }

    function isButtonPressed(idx) {
        return gamepad.buttons[idx].value != buttonState[idx] && gamepad.buttons[idx].pressed;
    }

    function isButtonReleased(idx) {
        return gamepad.buttons[idx].value != buttonState[idx] && !gamepad.buttons[idx].pressed;
    }

    function isButtonDown(idx) {
        return gamepad.buttons[idx].pressed;
    }

    let mode = 0
    let currentChord = null;
    setInterval(updateButtonState, 10);

    function updateButtonState() 
    {
        if (isButtonPressed(8)) {
            overdrive.wetMix = 1 - overdrive.wetMix;
        }

        if (isButtonPressed(16)) {
            mode = (mode + 1) % 3;
            addPopup(`mode ${mode}`);
        }


        if (mode == 0)
        {
            if (isButtonPressed(13))
            {
                // guitar.strumDownAtTime(guitar.chordStrings, guitar.audioCtx.currentTime, 0.2);
                guitar.pluckChordAtTime(guitar.chordStrings, guitar.audioCtx.currentTime+0.01, 1.8)
            }

            if (isButtonPressed(12))
            {
                guitar.strumDownAtTime(guitar.chordStrings, guitar.audioCtx.currentTime+0.01, 0.2);
            }

            if (isButtonPressed(0)) {
                currentChord = 0;
                guitar.holdFrets([0, 0, 2, 2, 1, 0])
                guitar.setChordStrings([1, 2, 3, 4, 5]);
            }

            if (isButtonPressed(1)) {
                currentChord = 1;
                guitar.holdFrets([0, 3, 2, 0, 1, 0])
                guitar.setChordStrings([1, 2, 3, 4, 5]);
            }

            if (isButtonPressed(2)) {
                currentChord = 2;
                guitar.holdFrets([0, 0, 0, 2, 3, 2]);
                guitar.setChordStrings([2, 3, 4, 5]);
            }

            if (isButtonPressed(3)) {
                currentChord = 3;
                guitar.holdFrets([0, 0, 3, 2, 1, 1]);
                guitar.setChordStrings([2, 3, 4, 5]);
            }

            if (isButtonPressed(4)) {
                currentChord = 4;
                guitar.holdFrets([0, 2, 2, 1, 0, 0]);
                guitar.setChordStrings();
            }

            for (let i = 0; i<5; i++)
            {
                if (isButtonReleased(i) && currentChord == i) {
                    currentChord = null;
                    guitar.releaseFrets();
                }
            }

            if (isAxisChanged(2)) {
                let tremoloValue = 0.1 * (1 + gamepad.axes[2]) / 2;
                guitar.setTremolo(tremoloValue);
            }
        }
        else if (mode == 1)
        {
            if (isButtonDown(0)) {
                if (currentChord != 0) {
                    currentChord = 0;
                }
            }
            else if (isButtonDown(1)) {
                if (currentChord != 1) {
                    currentChord = 1;

                    let bar = 3
                    guitar.holdFrets([bar, bar+2, bar+2, bar+1, bar, bar])
                    guitar.setChordStrings();
                }
                
            }
            else if (isButtonDown(2)) {
                if (currentChord != 2) {
                    currentChord = 2;

                    let bar = 7
                    guitar.holdFrets([bar, bar+2, bar+2, bar+0, bar, bar])
                    guitar.setChordStrings();
                }

            }
            else if (isButtonDown(3)) {
                if (currentChord != 3) {
                    currentChord = 3;

                    let bar = 5
                    guitar.holdFrets([bar, bar+2, bar+2, bar+1, bar, bar])
                    guitar.setChordStrings();
                    // let bar = 5
                    // guitar.holdFrets([bar, bar+2, bar+2, bar+1, bar, bar])
                    // guitar.setChordStrings();
                }

            }
            else if (isButtonDown(4)) {
                if (currentChord != 4) {
                    currentChord = 4;
                }
            }
            else {
                if (currentChord != null) {
                    currentChord = null;
                    guitar.releaseFrets();
                }
            }

            if (isButtonPressed(13))
            {
                guitar.strumDownAtTime(guitar.chordStrings, guitar.audioCtx.currentTime + 0.05, 0.1);
            }

            if (isButtonPressed(12))
            {
                guitar.strumUpAtTime(guitar.chordStrings, guitar.audioCtx.currentTime + 0.05, 0.1);
            }

            if (isAxisChanged(2)) {
                let tremoloValue = 0.1 * (1 + gamepad.axes[2]) / 2;
                guitar.setTremolo(tremoloValue);
            }


        }

        if (mode == 2) {
            let _ = null;
            let mod1 = isButtonDown(0);
            if (isButtonPressed(1) && !mod1) {
                playEighth(guitar, [_, _, 12, _, _, _], 0, 0.1);
            }
            if (isButtonPressed(1) && mod1) {
                playEighth(guitar, [_, _, 14, _, _, _], 0, 0.1);
            }
            if (isButtonPressed(3) && !mod1) {
                playEighth(guitar, [_, _, _, 12, _, _], 0, 0.1);
            }
            if (isButtonPressed(3) && mod1) {
                playEighth(guitar, [_, _, _, 14, _, _], 0, 0.1);
            }
            if (isButtonPressed(2) && !mod1) {
                playEighth(guitar, [_, _, _, _, 15, _], 0, 0.1);
            }
            if (isButtonPressed(2) && mod1) {
            }
            if (isButtonPressed(4) && !mod1) {
                playEighth(guitar, [_, _, _, _, _, 14], 0, 0.1);
            }
            if (isButtonPressed(4) && mod1) {
                playEighth(guitar, [_, _, _, _, _, 15], 0, 0.1);
            }

            
            // playEighth(guitar, [_, _, 12, _, _, _], 0, 0);
            // playEighth(guitar, [_, _, _, _, 15, _], 0, 1);
            // playEighth(guitar, [_, _, _, 14, _, _], 0, 2);
            // playEighth(guitar, [_, _, _, 12, _, _], 0, 3);
            // playEighth(guitar, [_, _, _, _, _, 15], 0, 4);
            // playEighth(guitar, [_, _, _, 14, _, _], 0, 5);
            // playEighth(guitar, [_, _, _, _, _, 14], 0, 6);
            // playEighth(guitar, [_, _, _, 14, _, _], 0, 7);
    

        }

        axisState = gamepad.axes.map(a => a);
        buttonState = gamepad.buttons.map(b => b.value);

    }
}