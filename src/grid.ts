
export function createRegularGrid(min: number, max: number, dx: number): IGrid {

    return {
        min: min,
        max: max,
        dx: dx,
        x: [...createGrid(0, 1, dx)],

        getIndex: function (x: number) {
            return Math.max(0, Math.min(Math.floor((x - this.min) / this.dx), this.x.length - 1));
        }
    };
}

function* createGrid(min: number, max: number, step: number) {
    for (let v = min; v < max; v += step) {
        yield v;
    }
}

