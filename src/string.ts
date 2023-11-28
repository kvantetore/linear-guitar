import { pluck } from "./functions";
import { addLinePlot } from "./plotting";
import { createDampedWaveOperator, createInitialState, diff2 } from "./propagation";


export class String {
    public state: IState;
    public fretPosition: number;

    public pullPosition: number;
    public pullForce: number;
    public frequency: number;
    public dampingCoefficient: number;

    public grid: IGrid;
    public operator: Operator;
    public dt: number;
    public stepIndex: number;
    public force: Float32Array;

    public plot;
    public fretMarker;

    public frets = [
      1 - 0.000,
      1 - 0.056,
      1 - 0.109,
      1 - 0.159,
      1 - 0.206,
      1 - 0.251,
      1 - 0.293,
      1 - 0.333,
      1 - 0.370,
      1 - 0.406,
      1 - 0.439,
      1 - 0.470,
      1 - 0.500, // one octave
    ]

    constructor(grid: IGrid, dt: number, frequency: number) {
        this.grid = grid;
        this.state = createInitialState(grid);
        this.frequency = frequency;
        this.dampingCoefficient = 4;
        // this.operator = createDampedWaveOperator(grid, frequency, 4);
        this.dt = dt;
        this.stepIndex = 0;

        this.force = new Float32Array(grid.x.length);

    }

    public step() {
        this.stepIndex++;
        var fretPosition = this.fretPosition ?? 1;
        let fretGridIndex = this.fretPosition != null
            ? this.grid.getIndex(this.fretPosition)
            : null;

        if (fretGridIndex != null) {
            this.state.y[fretGridIndex] = 0;
            this.state.ydiff[fretGridIndex] = 0;
        }

        let c = this.frequency * this.frequency * 2;
        let force = diff2(this.grid, this.state.y, this.force);

        let dampingCoefficient = this.pullPosition != null ? 100 : 4;
        // let dampingCoefficient = 4;

        for (let i = 0; i < this.grid.x.length; i++) {
            force[i] = c * force[i] - dampingCoefficient * this.state.ydiff[i];
        }

        if (this.pullPosition != null) {
            let pullIndex = this.grid.getIndex(this.pullPosition);
            let pullForce = this.pullForce * c * fretPosition / (this.pullPosition * (fretPosition - this.pullPosition) * this.grid.dx);

            force[pullIndex] += pullForce;
        }

        for (let i = 0; i < this.grid.x.length; i++) {
            if (fretGridIndex == i) {
                continue;
            }

            let nextYDiff = this.state.ydiff[i] + this.dt * force[i];
            let nextY = this.state.y[i] + this.dt * nextYDiff;

            this.state.y[i] = nextY;
            this.state.ydiff[i] = nextYDiff;
        }
    }

    public strum(position: number) {
        this.state.y = pluck(this.grid, position, this.fretPosition);
    }

    public pullString(x, y) {

    }

    public addPlot() {
        this.plot = addLinePlot(this.grid.x, this.state.y, { height: 25 });
        this.fretMarker = this.plot.addMarker(this.fretPosition ?? 1, 0, "red");

        for (let fret of this.frets) {
            this.plot.addVertical(fret, "gray");
        }

        function down(event) {
            if (event.buttons == 1) {
                let x = event.offsetX / this.plot.svg.clientWidth;
                let y = 1 - 2 * event.offsetY / this.plot.svg.clientHeight;

                if (event.ctrlKey) {
                    this.fretPosition = x;
                }
                else {
                    this.pullPosition = x;
                    this.pullForce = y;
                }
            }
        }

        function up(event) {
            this.pullPosition = null;
            this.pullForce = 0;
        }

        this.plot.svg.addEventListener("mousedown", down.bind(this));
        this.plot.svg.addEventListener("mousemove", down.bind(this));
        this.plot.svg.addEventListener("mouseup", up.bind(this));
        this.plot.svg.addEventListener("mouseleave", up.bind(this));
    }

    public updatePlot() {
        this.plot.update(this.grid.x, this.state.y);
        this.fretMarker.update(this.fretPosition ?? 1, 0, "red");
    }

}
