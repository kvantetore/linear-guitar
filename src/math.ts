import { mathjax } from 'mathjax-full/js/mathjax'
import { TeX } from 'mathjax-full/js/input/tex'
import { SVG } from 'mathjax-full/js/output/svg'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages'
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html'

const adaptor = browserAdaptor()
RegisterHTMLHandler(adaptor)

const mathjax_document = mathjax.document('', {
    InputJax: new TeX({ packages: AllPackages }),
    OutputJax: new SVG({ fontCache: 'local' })
})


const mathjax_options = {
    em: 16,
    ex: 8,
    containerWidth: 1280
}

export function addMath(math: string, after: string = null): { update: (string) => void}
{
    var container = document.createElement("div");
    container.style.fontSize = "2em";
    container.style.margin = "2em";
    container.style.display = "flex";
    container.style.alignItems = "center"
    document.body.append(container);

    var equation = document.createElement("div");
    equation.style.flexGrow = "1";
    equation.style.textAlign = "center";
    container.append(equation);

    function update(math: string) {
        let node = mathjax_document.convert(math, mathjax_options);
        equation.innerHTML = "";
        adaptor.append(equation, node);
    }

    update(math);

    if (after) {
        let afterDiv = document.createElement("div");
        afterDiv.innerText = after;
        container.append(afterDiv)
    }

    return {
        update: update,
    };
}

export function addMathSteps(mathSteps: string[], after: string = null) {

    var container = document.createElement("div");
    container.style.fontSize = "2em";
    container.style.margin = "2em";
    container.style.display = "flex";
    container.style.alignItems = "center"
    document.body.append(container);

    var equation = document.createElement("div");
    equation.style.flexGrow = "1";
    equation.style.textAlign = "center";
    container.append(equation);

    let current = 0;
    update();
    
    function update() {
        let math = mathSteps[current];

        const node = mathjax_document.convert(math, mathjax_options)
        equation.innerHTML = "";
        adaptor.append(equation, node);
    }

    container.addEventListener("click", () => {
        if (current < mathSteps.length - 1) {
            current++;
            update();
        }
    })


    if (after) {
        let afterDiv = document.createElement("div");
        afterDiv.innerText = after;
        container.append(afterDiv)
    }

    return container;

}
