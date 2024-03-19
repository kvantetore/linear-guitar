import { createRegularGrid } from "../tools/grid";
import { addHeader, addMath, addMathText } from "../tools/math";
import { addAnimatedLinePlot, addLinePlot } from "../tools/plotting";
import { StepperFunctions, StepperMath, addStepperKeyboardBinding } from "../tools/stepper";


let grid = createRegularGrid(0, 1, 128);

export function slide3() {
    addHeader("Analytical Solution");

    let stepper = new StepperFunctions([
        () => new StepperMath([
            `\\frac{F_x}{\\mu} \\frac{\\partial^2 f}{\\partial x^2} = \\frac{\\partial^2 f}{\\partial t^2}`
        ], "(I)"),
        () => addMathText("Try an \"arbitrary\" solution:"),
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
        () => addMathText("Insert (III) and (II) into (I):"),
        () => new StepperMath([
            `- \\frac{F_x}{\\mu} a^2 f(x,t) = -b^2 f(x,t)`,
            `\\frac{F_x}{\\mu} = \\frac{b^2}{a^2}`
        ]),
        () => addMathText("Apply boundary conditions:"),
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
            addMath("f_1(x,t) = \\sin (\\pi x) \\sin(\\pi t)");
            addAnimatedLinePlot(grid.x, (t) => grid.x.map(x => Math.sin(Math.PI * x) * Math.sin(Math.PI * t)));
        },
        () => {
            addMath("f_2(x,t) = \\sin (2 \\pi x) \\sin(2 \\pi t) ")
            addAnimatedLinePlot(grid.x, (t) => grid.x.map(x => Math.sin(2 * Math.PI * x) * Math.sin(2 * Math.PI * t)));
        },
        () => {
            addMath("f_3(x,t) = \\sin (3 \\pi x) \\sin(3 \\pi t) ")
            addAnimatedLinePlot(grid.x, (t) => grid.x.map(x => Math.sin(3 * Math.PI * x) * Math.sin(3 * Math.PI * t)));
        },
        () => {
            addMath("f_4(x,t) = \\sin (4 \\pi x) \\sin(4 \\pi t) ")
            addAnimatedLinePlot(grid.x, (t) => grid.x.map(x => Math.sin(4 * Math.PI * x) * Math.sin(4 * Math.PI * t)));
        },
        () => {
            addMath("f_5(x,t) = \\sin (5 \\pi x) \\sin(5 \\pi t) ")
            addAnimatedLinePlot(grid.x, (t) => grid.x.map(x => Math.sin(5 * Math.PI * x) * Math.sin(5 * Math.PI * t)));
        }

    ]);

    addStepperKeyboardBinding(stepper);
};