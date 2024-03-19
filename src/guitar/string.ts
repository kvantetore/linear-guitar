import { diff2, sqr } from "../tools/propagation";


export class String {
    public fretPosition: number;

    public pullPosition: number;
    public pullForce: number;
    public frequency: number;
    public dampingCoefficient: number;

    public grid: IGrid;
    public dt: number;

    public f: Float32Array;
    public v: Float32Array;
    public force: Float32Array;

    // a normal guitar is tuned to equal temperament
    public static frets = [
        Math.pow(2, -0/12),
        Math.pow(2, -1/12),
        Math.pow(2, -2/12),
        Math.pow(2, -3/12),
        Math.pow(2, -4/12),
        Math.pow(2, -5/12),
        Math.pow(2, -6/12),
        Math.pow(2, -7/12),
        Math.pow(2, -8/12),
        Math.pow(2, -9/12),
        Math.pow(2, -10/12),
        Math.pow(2, -11/12),
        Math.pow(2, -12/12),
        Math.pow(2, -13/12),
        Math.pow(2, -14/12),
        Math.pow(2, -15/12),
        Math.pow(2, -16/12),
    ]

    constructor(grid: IGrid, dt: number, frequency: number) {
        this.grid = grid;

        this.frequency = frequency;
        this.dampingCoefficient = 4;
        this.dt = dt;

        this.f = new Float32Array(grid.N);
        this.v = new Float32Array(grid.N);
        this.force = new Float32Array(grid.N);
    }

    public step() {
        // align active fret with a grid point for simplicity 
        var fretPosition = this.fretPosition ?? 1;
        let fretGridIndex = this.fretPosition != null
            ? this.grid.getIndex(this.fretPosition)
            : null;

        if (fretGridIndex != null) {
            this.f[fretGridIndex] = 0;
            this.v[fretGridIndex] = 0;
        }

        // constant from wave equation in "natural guitar units"
        let c = sqr(this.frequency * 2);

        // string force (d^2/dx^2)
        let force = diff2(this.grid, this.f, this.force);
        for (let i = 0; i < this.grid.N; i++) {
            force[i] = c * force[i];
        }

        // add friction (proportional to speed)
        for (let i = 0; i < this.grid.N; i++) {
            force[i] -= this.dampingCoefficient * this.v[i];
        }

        // add pull force in a single grid point
        if (this.pullPosition != null && this.pullPosition != fretPosition) {
            let pullIndex = this.grid.getIndex(this.pullPosition);

            // balance the pull force such that it is in equilibrium with the string force
            // when the string is pulled to f=1
            let pullForce = this.pullForce * c * fretPosition / (this.pullPosition * (fretPosition - this.pullPosition) * this.grid.dx);

            force[pullIndex] += pullForce;
        }

        // use leap-frog to propagate one time step 
        for (let i = 0; i < this.grid.N; i++) {
            if (fretGridIndex == i) {
                continue;
            }

            let nextV = this.v[i] + this.dt * force[i];
            let nextF = this.f[i] + this.dt * nextV;

            this.f[i] = nextF;
            this.v[i] = nextV;
        }
    }
}
