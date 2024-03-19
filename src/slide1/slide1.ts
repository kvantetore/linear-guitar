import { addBlockQuote, addHeader, addImage, addMath, addMathText, addParagraph } from "../tools/math";
import { StepperFunctions, StepperMath, addStepperKeyboardBinding } from "../tools/stepper";

export async function slide1() {
    let guitar = "🎸\\space\\space\\space\\space"
    var image

    addHeader("Assume a linear guitar");
    let stepper = new StepperFunctions([
        () => addParagraph("What is a linear guitar?"),
        () => addParagraph("Copilot:"),
        () => addBlockQuote("A linear guitar is not a common term in the world of musical instruments. However, I suspect there might be some confusion here"),
        () => addParagraph("DALL·E 3:"),
        () => image = addImage("/img/31c09cbb-119e-4c5c-bce4-e65c93d62e77.jpg"),
        () => image.update("/img/4091b557-1e53-4290-bbe2-809d6ef5c6e3.jpg"),
        () => image.update("/img/linearguitar.jpg"),
        () => addParagraph("Linear algebra:"),
        () => addMath(`${guitar}(x) + ${guitar}(y) = ${guitar}(x+y)`),
        () => addParagraph("I think we're on to something...") 
    ]);

    addStepperKeyboardBinding(stepper);


}