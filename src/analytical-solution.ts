import { createRegularGrid } from "./grid";
import { addMath } from "./math";
import { addLinePlot } from "./plotting";


class Stepper {
    private _subStepper: Stepper
    private _current: number;

    constructor() {
        this._current = 0;
    }

    async Next() : Promise<(boolean|Stepper)> {
        let result: (boolean|Stepper) = false;

        if (this._subStepper != null) {
            result = await this._subStepper.Next();
            if (result == false) {
                this._subStepper = null
                return await this.Next();
            }
        }

        if (result == false) {
            result = await this.RunStep(this._current);
            this._current++;
        }

        if (result instanceof Stepper) {
            this._subStepper = result;
            return await this.Next();
        }

        return result;
    }

    async RunStep(step: number) : Promise<(boolean|Stepper)> {
        return false;
    }
 }


type StepperFunction = () => (void|boolean|Stepper)

class StepperFunctions extends Stepper {
    private _steps: StepperFunction[];

    public constructor(steps: StepperFunction[]) {
        super()

        this._steps = steps;
    } 

    async RunStep(step: number) : Promise<(boolean|Stepper)> {
        if (step < this._steps.length) {
            let result = this._steps[step]();
            if (typeof result === "undefined") {
                return true;
            }

            return result;
        }
        return false;
    }
}

class StepperMath extends Stepper {
    private _steps: string[];
    private _math
    private _numbering: string;

    public constructor(steps: string[], numbering: string = null) {
        super()
        this._steps = steps;
        this._numbering = numbering;
    }

    async RunStep(step: number): Promise<boolean | Stepper> {
        if (step < this._steps.length) {
            let math = this._steps[step];

            if (this._math == null) {
                this._math = addMath(math, this._numbering)
            }
            else {
                this._math.update(math)
            }

            return true;
        }
        
        return false;
    }
}


let grid = createRegularGrid(0, 1, 0.01);
let standingWavePlot: { update(x: number[], y: number[] ) } = null;
let standingWaveEquation : {update(math: string) } = null;

let stepper = new StepperFunctions([
    () => new StepperMath([
        `\\frac{F_x}{\\mu} \\frac{\\partial^2 f}{\\partial x^2} = \\frac{\\partial^2 f}{\\partial t^2}`
    ], "(I)"),
    () => new StepperMath([
        `f(x, t) = ?`,
        `f(x, t) = \\alpha \\sin(a x + \\phi_1) \\sin(b t + \\phi_2)`,
        `f(x, t) = \\sum_{\\alpha,a,b,\\phi,\\phi2} \\alpha \\sin(a x + \\phi_1) \\sin(b t + \\phi_2)`
    ]),
    () => new StepperMath([
        `\\frac{\\partial^2}{\\partial x^2} f(x,t) =  `,
        `\\frac{\\partial^2}{\\partial x^2} f(x,t) = - a^2 \\alpha \\sin(a x + \\phi_1) \\sin(b t + \\phi_2)`,
        `\\frac{\\partial^2}{\\partial x^2} f(x,t) = - a^2 f(x, t)`,
    ], "(II)"),
    () => new StepperMath([
        `\\frac{\\partial^2}{\\partial t^2} f(x,t) =  `,
        `\\frac{\\partial^2}{\\partial t^2} f(x,t) = - b^2 \\alpha \\sin(a x + \\phi_1) \\sin(b t + \\phi_2)`,
        `\\frac{\\partial^2}{\\partial t^2} f(x,t) = - b^2 f(x, t)`
    ], "(III)"),
    () => new StepperMath([
        `- \\frac{F_x}{\\mu} a^2 f(x,t) = -b^2 f(x,t)`,
        `\\frac{F_x}{\\mu} = \\frac{b^2}{a^2}`
    ]),
    () => new StepperMath([
        `f(0, t) = 0`,
        `f(0, t) = 0 = \\alpha \\sin(\\phi_1) \\sin(b t + \\phi_2)`,
        `f(0, t) = 0 = \\alpha \\sin(\\phi_1) \\sin(b t + \\phi_2) \\implies \\phi_1 = 0`,
    ], "(IV)"),
    () => new StepperMath([
        `f(L, t) = 0`,
        `f(L, t) = 0 \\implies \\sin(a L) = 0`,
        `f(L, t) = 0 \\implies \\sin(a L) = 0 \\implies a L = n \\pi, \\,\\, n = 1, 2, 3, ...`
    ], "(V)"),
    () => new StepperMath([
        `\\lambda_n = \\frac{2 L}{n}, \\,\\,\\, c^2 = \\frac{F_x}{\\mu}`,
    ]),
    () => new StepperMath([
        `f(x, t) = \\sum_n \\alpha_n \\sin(\\pi x n / L) \\sin(\\pi t c n / L + \\phi_n)`,
    ]),
    () => {
        standingWaveEquation = addMath("\\sin \\pi x")
        standingWavePlot = addLinePlot(grid.x, grid.x.map(x => Math.sin(Math.PI * x)))
    },
    () => {
        standingWaveEquation.update("\\sin 2 \\pi x")
        standingWavePlot.update(grid.x, grid.x.map(x => Math.sin(Math.PI * x * 2)))
    },
    () => {
        standingWaveEquation.update("\\sin 3 \\pi x")
        standingWavePlot.update(grid.x, grid.x.map(x => Math.sin(Math.PI * x * 3)))
    },
    () => {
        standingWaveEquation.update("\\sin 4 \\pi x")
        standingWavePlot.update(grid.x, grid.x.map(x => Math.sin(Math.PI * x * 4)))
    },
    () => {
        standingWaveEquation.update("\\sin 5 \\pi x")
        standingWavePlot.update(grid.x, grid.x.map(x => Math.sin(Math.PI * x * 5)))
    }

]);


document.addEventListener("keydown", (evt) => {
    if (evt.key == " ") {
        stepper.Next();
    }
})
