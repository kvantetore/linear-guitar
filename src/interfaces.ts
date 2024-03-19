interface IGrid {
    min: number,
    max: number,
    dx: number,
    N: number,
    x: number[],

    getIndex(x: number): number,
}

interface IState {
    y: number[],
    ydiff: number[],
    t: number,
}

interface IOperatorResult {
    ydiff: number[],
    ydiff2: number[],
}

type Operator = (state: IState) => IOperatorResult
