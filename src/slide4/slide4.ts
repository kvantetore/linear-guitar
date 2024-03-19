import { addHeader, addMath, addMathText } from "../tools/math";
import { StepperFunctions, StepperMath, addStepperKeyboardBinding } from "../tools/stepper";

export async function slide4() {
    addHeader("Discretization");

    let stepper = new StepperFunctions([
        () => addMathText("We use equispaced grid points between 0 and 1 (excluding boundaries)"),
        () => new StepperMath([
            `x_i = \\frac{i + 1}{N + 1}`
        ]),
        () => addMathText("And sample our function in those grid points"),
        () => new StepperMath([
            `f_i(t) = f(x_i, t)`
        ]),
        () => addMathText("Using centered finite difference for the space differentiation"),
        () => new StepperMath([
            `\\frac{\\partial^2}{\\partial x^2} f(x_i, t) = \\frac{f_{i-1}(t) - 2 f_i(t) + f_{i+1}}{\\Delta x^2} + \\mathcal{O}(\\Delta x^3)`
        ]),
        () => addMathText("We can write the wave equation as a system of coupled equations of deflection (f) and velocity (v)"),
        () => new StepperMath([
            `\\displaylines{ 
                \\frac{\\partial}{\\partial t} f_i(t) &=& v_i(t)  \\\\
                \\frac{\\partial}{\\partial t} v_i(t) &=& c \\frac{f_{i-1}(t) - 2 f_i(t) + f_{i+1}}{\\Delta x^2}
            }`
        ]),
        () => addMathText("Using a leapfrog integration scheme for discretizing time we arrive at"),
        () => new StepperMath([
            `\\displaylines{ 
                v_i^{h+1/2} &=& v_i^{h-1/2} + c \\frac{f_{i-1} - 2 f_i(t) + f_{i+1}}{\\Delta x^2} \\Delta t \\\\
                f_i^{h+1} &=& f_i^{h+1} + v_i^{h+1/2} \\Delta t 
            }`
        ])

    ]);

    addStepperKeyboardBinding(stepper);

    // while (await stepper.Next()) {
    // }
}

