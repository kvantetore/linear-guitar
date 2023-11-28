
export function diff2(grid: IGrid, y: number[], dest: Float32Array = null) {
    if (dest == null)
    {
        dest = new Float32Array(grid.x.length);
    }
    let dx2 = grid.dx * grid.dx;
    let i = 0;
    dest[i] = (- 2 * y[i] + y[i + 1]) / dx2;
    for (i = 1; i < grid.x.length - 1; i++) {
        dest[i] = (y[i - 1] - 2 * y[i] + y[i + 1]) / dx2;
    }
    dest[i] = (y[i - 1] - 2 * y[i]) / dx2;

    return dest;
}


export function createWaveOperator(grid: IGrid, frequency: number): Operator {
    let c = 2 * frequency * frequency;
    return function (state: IState) {
        return {
            ydiff: grid.x.map((x, i) => 0),
            ydiff2: diff2(grid, state.y).map((v, i) => v * c - 4 * state.ydiff[i]),
        }
    }
}

export function createDampedWaveOperator(grid: IGrid, frequency: number, damping: number): Operator {
    let c = 2 * frequency * frequency;
    return function (state: IState) {
        return {
            ydiff: grid.x.map((x, i) => 0),
            ydiff2: diff2(grid, state.y).map((v, i) => v * c - damping * state.ydiff[i]),
        }
    }
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


export type PinnedPositions = { [key: number]: number };
export let pinnedPositions: PinnedPositions = [];

export function createLeapFrogStepper(grid: IGrid, operator: Operator, dt: number) {
    return function (state: IState) {
        for (let i = 0; i < grid.x.length; i++) {
            if (pinnedPositions[i] !== undefined) {
                state.y[i] = pinnedPositions[i];
                state.ydiff[i] = 0;
            }
        }

        let op = operator(state);

        for (let i = 0; i < grid.x.length; i++) {
            if (pinnedPositions[i] !== undefined) {
                continue;
            }

            let nextYDiff = state.ydiff[i] + dt * op.ydiff2[i];
            let nextY = state.y[i] + dt * nextYDiff;

            state.y[i] = nextY;
            state.ydiff[i] = nextYDiff;
            state.t = state.t + dt;
        }
    }
}


