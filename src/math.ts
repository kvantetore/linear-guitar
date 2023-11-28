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

export function addMath(math: string)
{
    const node = mathjax_document.convert(math, mathjax_options)

    var container = document.createElement("div");
    document.body.append(container);

    adaptor.append(container, node);

    return container;
}
