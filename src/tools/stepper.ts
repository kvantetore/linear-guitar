import { addMath } from "./math";

type StepperFunction = () => (void|boolean|Stepper)

export class Stepper {
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


export class StepperFunctions extends Stepper {
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

export class StepperMath extends Stepper {
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


export function addStepperKeyboardBinding(stepper: Stepper){
    document.addEventListener("keydown", async (evt) => {
        if (evt.key == " ") {
            let v = await stepper.Next();
            console.log(v);
        }
        else if (evt.key == "ArrowRight") {
            await stepper.Next();
        }
        else if (evt.key == "End") {
            while (await stepper.Next()) {
            }
        }
    });

}
