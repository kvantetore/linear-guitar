
export function createRegularGrid(min: number, max: number, N: number): IGrid {
    let dx = 1.0 / (N + 1); 

    return {
        min: min,
        max: max,
        dx: dx,
        N: N,
        x: [...Array(N).keys()].map(i => (i + 1) * dx),

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

