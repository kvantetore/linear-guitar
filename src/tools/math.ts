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

export function addHeader(header: string) {
    var h1 = document.createElement("h1")
    h1.innerText = header;
    document.body.append(h1);
}

export function addParagraph(text: string) {
    var p = document.createElement("p")
    p.innerText = text;
    p.style.fontSize = "2em";
    p.style.textAlign = "center";
    document.body.append(p);
}

export function addBlockQuote(text: string) {
    var p = document.createElement("blockquote")
    p.innerText = text;
    p.style.fontSize = "2em";
    p.style.textAlign = "center";
    document.body.append(p);
}

export function addImage(url: string) {
    var img = document.createElement("img");
    img.src = url;
    img.style.margin = "auto";
    img.style.maxHeight = "80vh";
    document.body.append(img);

    return {
        update: (url) => img.src = url,
    }
}

export function addMathText(text: string) {
    var elem = document.createElement("p")
    elem.className = "math-text";
    elem.innerText = text;
    document.body.append(elem);
}

export function addMath(math: string, after: string = null): { update: (string) => void}
{
    var container = document.createElement("div");
    container.className = "math";
    document.body.append(container);

    var equation = document.createElement("div");
    equation.className = "equation";
    container.append(equation);

    function update(math: string) {
        let node = mathjax_document.convert(math, mathjax_options);
        equation.innerHTML = "";
        adaptor.append(equation, node);
    }

    update(math);

    if (after) {
        let afterDiv = document.createElement("div");
        afterDiv.className = "after"
        afterDiv.innerText = after;
        container.append(afterDiv)
    }

    return {
        update: update,
    };
}

