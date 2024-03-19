import { pluck } from "./functions";

export function diff2(grid: IGrid, y: (number[]|Float32Array), dest: Float32Array = null) {
    if (dest == null)
    {
        dest = new Float32Array(grid.x.length);
    }
    let dx2 = grid.dx * grid.dx;
    let i = 0;
    
    // function is zero at "i == -1"
    dest[i] = (- 2 * y[i] + y[i + 1]) / dx2;

    // regular finite difference
    for (i = 1; i < grid.x.length - 1; i++) {
        dest[i] = (y[i - 1] - 2 * y[i] + y[i + 1]) / dx2;
    }

    //function is zero at "i == N"
    dest[i] = (y[i - 1] - 2 * y[i]) / dx2;

    return dest;
}

export function signedSquare(f: number) {
    return f > 0 ? f * f : -f * f;
}

export function createStandingWave(grid: IGrid, n: number) {
    return grid.x.map(x => Math.sin(Math.PI * n * x));
}

export function createSquareWave(grid: IGrid, startX: number = 0.1, endX: 0.3) : number[] { 
    return grid.x.map(x => x < startX || x >= endX ? 0 : 1);
}

export function createSawtoothWave(grid: IGrid, startX: number = 0.1, endX: number = 0.3) : number[] {
    var slope = 2 / (endX - startX);
    var midPoint = (endX + startX) / 2;
    return grid.x.map(x => 
        x < startX ? 0
        : x < midPoint ? slope * (x - startX)
        : x < endX ? 1 - slope * (x - midPoint)
        : 0); 
}

export function createPluckedString(grid: IGrid, pluckPosition: number) {
    var startSlope = 1 / pluckPosition;
    var endSlope = 1 / (1 - pluckPosition);

    return grid.x.map(x => 
        x < pluckPosition ? startSlope * x
        : 1 - endSlope * (x - pluckPosition));
}


export function createInitialState(grid: IGrid, initialY: number[] = null): IState {
    if (initialY === null) {
        initialY = grid.x.map(x => 0);
    }

    return {
        y: initialY,
        ydiff: grid.x.map(x => 0),
        t: 0,
    };
}


export function calculateOverlap(grid: IGrid, base: number[], f: number[]) {
    let fsum = 0;
    for (let i = 0; i<grid.N; i++) {
        fsum += base[i] * f[i];
    }

    return 2 * fsum * grid.dx;
}

export function sqr(v: number) {
    return v * v;
}

