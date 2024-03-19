import { Guitar } from "./guitar/guitar";
import { addButton } from "./tools/ui";

let bpm = 122;
let eighthDuration = 60 / bpm / 2;
let measureDuration = 8 * eighthDuration;

function note(guitar: Guitar, v: number[], measure: number, eighth: number, duration: number) {
    let time = guitar.audioCtx.currentTime;
    for (let s in v) {
        if (v[s] != null) {
            console.log(s, v[s])
            guitar.playNoteAtTime(guitar.strings[s], v[s], time + measure * measureDuration + eighth * eighthDuration, duration)
        }
    }
}

export function playEighth(guitar: Guitar, v: number[], measure: number, eighth: number) {
    note(guitar, v, measure, eighth, eighthDuration)
}

export function playQuarter(guitar: Guitar, v: number[], measure: number, eighth: number) {
    note(guitar, v, measure, eighth, eighthDuration)
}

export function addSong1(guitar: Guitar)
{
    addButton("Play", () => {
        var time = guitar.audioCtx.currentTime + 0.5;
      
        let _ = null;
      
        note(guitar, [_, 5, 5, _, _, _], 0, 0, 1 * eighthDuration);
        note(guitar, [_, _, 3, 3, _, _], 0, 2, 1 * eighthDuration);
        note(guitar, [_, _, 5, 5, _, _], 0, 4, 2 * eighthDuration);
        note(guitar, [_, 5, 5, _, _, _], 0, 7, 1 * eighthDuration);
      
        note(guitar, [_, _, 3, 3, _, _], 1, 1, 1 * eighthDuration);
        note(guitar, [_, _, 6, 6, _, _], 1, 3, 1 * eighthDuration);
        note(guitar, [_, _, 5, 5, _, _], 1, 4, 2 * eighthDuration);
      
        note(guitar, [_, 5, 5, _, _, _], 2, 0, 1 * eighthDuration);
        note(guitar, [_, _, 3, 3, _, _], 2, 2, 1 * eighthDuration);
        note(guitar, [_, _, 5, 5, _, _], 2, 4, 2 * eighthDuration);
        note(guitar, [_, _, 3, 3, _, _], 2, 7, 1 * eighthDuration);
      
        note(guitar, [_, 5, 5, _, _, _], 3, 1, 3 * eighthDuration);
      
      });
}


export function addSong2(guitar: Guitar) {
    addButton("Play", () => {
        let _ = null;
        playEighth(guitar, [_, _, 12, _, _, _], 0, 0);
        playEighth(guitar, [_, _, _, _, 15, _], 0, 1);
        playEighth(guitar, [_, _, _, 14, _, _], 0, 2);
        playEighth(guitar, [_, _, _, 12, _, _], 0, 3);
        playEighth(guitar, [_, _, _, _, _, 15], 0, 4);
        playEighth(guitar, [_, _, _, 14, _, _], 0, 5);
        playEighth(guitar, [_, _, _, _, _, 14], 0, 6);
        playEighth(guitar, [_, _, _, 14, _, _], 0, 7);

        playEighth(guitar, [_, _, 12, _, _, _], 1, 0);
        playEighth(guitar, [_, _, _, _, 15, _], 1, 1);
        playEighth(guitar, [_, _, _, 14, _, _], 1, 2);
        playEighth(guitar, [_, _, _, 12, _, _], 1, 3);
        playEighth(guitar, [_, _, _, _, _, 15], 1, 4);
        playEighth(guitar, [_, _, _, 14, _, _], 1, 5);
        playEighth(guitar, [_, _, _, _, _, 14], 1, 6);
        playEighth(guitar, [_, _, _, 14, _, _], 1, 7);

        playEighth(guitar, [_, _, 14, _, _, _], 2, 0);
        playEighth(guitar, [_, _, _, _, 15, _], 2, 1);
        playEighth(guitar, [_, _, _, 14, _, _], 2, 2);
        playEighth(guitar, [_, _, _, 12, _, _], 2, 3);
        playEighth(guitar, [_, _, _, _, _, 15], 2, 4);
        playEighth(guitar, [_, _, _, 14, _, _], 2, 5);
        playEighth(guitar, [_, _, _, _, _, 14], 2, 6);
        playEighth(guitar, [_, _, _, 14, _, _], 2, 7);

        playEighth(guitar, [_, _, 14, _, _, _], 3, 0);
        playEighth(guitar, [_, _, _, _, 15, _], 3, 1);
        playEighth(guitar, [_, _, _, 14, _, _], 3, 2);
        playEighth(guitar, [_, _, _, 12, _, _], 3, 3);
        playEighth(guitar, [_, _, _, _, _, 15], 3, 4);
        playEighth(guitar, [_, _, _, 14, _, _], 3, 5);
        playEighth(guitar, [_, _, _, _, _, 14], 3, 6);
        playEighth(guitar, [_, _, _, 14, _, _], 3, 7);

    });
}



