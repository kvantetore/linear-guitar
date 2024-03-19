
export function standingWave(grid: IGrid, mode: number) {
    return grid.x.map(x => Math.sin(mode * x * Math.PI));
}

export function pluck(grid: IGrid, pluckPosition: number, fretPosition: number = 1) {
    return grid.x.map(x => {
        if (x < pluckPosition) {
            return x / pluckPosition;
        } else {
            return 1 - (x - pluckPosition) / (1 - pluckPosition)
        }
    });
}