import { createRegularGrid } from "./grid";
import { addMath, addMathSteps } from "./math";
import { addLinePlot } from "./plotting";
import * as d3 from 'd3';

let width = document.body.clientWidth;
let height = width * 2 / 3  
let margin = 0

let xMapping = d3.scaleLinear().domain([0,1]).range([0, width]);
let yMapping = d3.scaleLinear().domain([-1,1]).range([0, height]);


let grid = createRegularGrid(0, 1, 0.01);
let f = grid.x.map(x => Math.sin(Math.PI*x*2) * Math.exp(-10*Math.pow(x-0.5, 2)) )

var zoom = d3.zoom()
    .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([[0, 0], [width, height]])
    .on("zoom", ({transform}) => {
        viewport.attr("transform", transform);
    })
    ;


let svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `${-margin} ${-margin} ${width+2*margin} ${height+2*margin}`)
    ;

document.body.append(svg.node())

let viewport = svg.append("g")
    //.attr("transform", `translate(${margin}, ${margin})`)
    ;
   
// let xaxis = viewport.append("g")
//     .attr("transform", `translate(0,${height})`)
//     .call(d3.axisBottom(xMapping));

// let yaxis = viewport.append("g")
//     // .attr("transform", `translate(0,${margin})`)
//     .call(d3.axisLeft(yMapping));

var line = d3.line()
    .x((_, i) => xMapping(grid.x[i]))
    .y((y, ) => yMapping(y))

let lineElem = viewport.append("path")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("d", line(f))

svg.append("svg:defs")
    .append("svg:marker")
    .attr("id", "arrow-head")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z");

let x1 = 0.35
let i1 = grid.x.findIndex(x => x >= x1)
let f1 = f[i1]
let diff1 = (f[i1] - f[i1-1]) / grid.dx


let x2 = 0.38
let i2 = grid.x.findIndex(x => x >= x2)
let f2 = f[i2]
let diff2 = (f[i2+1] - f[i2]) / grid.dx


function highlightSegment() {
    addLine(x1, f1, x1, 1, "black", 1, true);
    addLine(x2, f2, x2, 1, "black", 1, true);
    addLine(x1, f1, x2, f2, "brown", 5);

    viewport.append("text")
        .attr("x", xMapping((x1 + x2)/2 - 0.005))
        .attr("y", yMapping(0.9))
        .attr("style", "font-size: 0.75em")
        .text(() => "Δx")}

function plotDerivatives() {
    arrow(x1, f1, x1 - 0.1, f1 - 0.1 * diff1, "red");
    arrow(x2, f2, x2 + 0.1, f2 + 0.1 * diff2, "red");
}

function plotDerivativeDecompositions() {
    arrow(x1, f1, x1 - 0.1, f1, "green");
    arrow(x1, f1, x1, f1 - 0.1 * diff1, "green");

    viewport.append("path")
            .attr("d", `M ${xMapping(x1 - 0.05)}, ${yMapping(f1)} A 50 50, 0, 0, 0, ${xMapping(x1 - 0.05)}, ${yMapping(f1 - 0.05 * diff1)}`)
            .attr("fill", "none")
            .attr("stroke", "black")

    viewport.append("text")
        .attr("x", xMapping(x1-0.07))
        .attr("y", yMapping(f1+0.03))
        .attr("style", "font-size: 0.75em")
        .text(() => "θ₁")

    viewport.append("text")
        .attr("x", xMapping(x1-0.115))
        .attr("y", yMapping(f1+0.010))
        .attr("style", "font-size: 0.75em")
        .text(() => "-Fₓ")

    viewport.append("text")
        .attr("x", xMapping(x1-0.009))
        .attr("y", yMapping(f1-0.10 * diff1 + 0.04))
        .attr("style", "font-size: 0.75em")
        .text(() => "F₁")

    
    arrow(x2, f2, x2 + 0.1, f2, "green");
    arrow(x2, f2, x2, f2 + 0.1 * diff2, "green");

    viewport.append("path")
            .attr("d", `M ${xMapping(x2 + 0.05)}, ${yMapping(f2)} A 50 50, 0, 0, 0, ${xMapping(x2 + 0.05)}, ${yMapping(f2 + 0.05 * diff2)}`)
            .attr("fill", "none")
            .attr("stroke", "black")

    viewport.append("text")
        .attr("x", xMapping(x2+0.07))
        .attr("y", yMapping(f2-0.03))
        .attr("style", "font-size: 0.75em")
        .text(() => "θ₂")

    viewport.append("text")
        .attr("x", xMapping(x2+0.11))
        .attr("y", yMapping(f2+0.010))
        .attr("style", "font-size: 0.75em")
        .text(() => "Fₓ")

    viewport.append("text")
        .attr("x", xMapping(x2-0.005))
        .attr("y", yMapping(f2+0.10 * diff2 - 0.01))
        .attr("style", "font-size: 0.75em")
        .text(() => "F₂")

}



var currentStep = 0;
document.body.addEventListener("keypress", (evt) => {
    let step = parseInt(evt.key);
    if (!isNaN(step)){
        runStep(step);
    }

    if (evt.key == " ") {
        currentStep++;
        runStep(currentStep);
    }
});

function runStep(step: number) {
    if (step == 1) {
        highlightSegment();
    }
    if (step == 2) {
        zoomToSegment();
    }
    if (step == 3) {
        plotDerivatives();
    }
    if (step == 4) {
        plotDerivativeDecompositions();
    }
    if (step == 5) {
        addMathSteps([
            `
            \\frac{F_1}{F_x} = - \\tan \\theta_1
            `,
            `
            \\frac{F_1}{F_x} = - \\tan \\theta_1 = - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1}
            `,
            `
            \\frac{F_1}{F_x} = - \\tan \\theta_1 = - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1},
            \\frac{F_2}{F_x} = \\tan \\theta_2 = \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_2}
            `,
        ])
    }
    if (step == 6) {
        addMathSteps([
            `F_{total} = F_2 + F_1`,
            `F_{total} = F_2 + F_1 = F_x \\left[ \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_2} - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1}  \\right]`
        ], "(I)")
    }

    if (step == 7) {
        addMathSteps([
            `F_{total} = m a`,
            `F_{total} = m a = \\mu \\Delta x \\frac{\\partial^2 f}{\\partial t^2}`,
        ], "(II)")
    }

    if (step == 8) {
        addMath(`
            \\frac{F_x}{\\mu} \\frac{\\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1 + \\Delta x} - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1} }{\\Delta x} 
            = \\frac{\\partial^2 f}{\\partial t^2}
        `)
    }

    if (step == 9) {
        addMath(`
            \\frac{F_x}{\\mu} \\frac{\\partial^2 f}{\\partial x^2} = \\frac{\\partial^2 f}{\\partial t^2}
        `)

    }
}

// highlightSegment();
// zoomToSegment();
// plotDerivatives();
// plotDerivativeDecompositions();
// addMath(`\\frac{F_1}{F_x} = \\tan \\theta_1 = \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1}`)
// addMath(`F_{total} = F_2 + F_1 = F_x \\left[ \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_2} - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1}  \\right]`)

function zoomToSegment() {
    var centerX = (x1 + x2) / 2
    var centerY = (f1 + f2) / 2
    var scale = 2.8

    d3.transition().duration(2500).call(
        zoom.transform,
        d3.zoomIdentity.translate(width/2, height/2).scale(scale).translate(xMapping(-centerX),-yMapping(centerY))
    )
}

function addLine(x0, y0, x1, y1, color = "black", width = 1, dashed = false)
{
    var l = viewport.append("line")
        .attr("x1", xMapping(x0))
        .attr("y1", yMapping(y0))
        .attr("x2", xMapping(x1))
        .attr("y2", yMapping(y1))          
        .attr("stroke-width", width)
        .attr("stroke", color)
        ;

    if (dashed) {
        l.attr("stroke-dasharray", "5,5")
    }
}

function arrow(x0, y0, x1, y1, color = "black", width = 1)
{
    viewport.append("line")
        .attr("x1", xMapping(x0))
        .attr("y1", yMapping(y0))
        .attr("x2", xMapping(x1))
        .attr("y2", yMapping(y1))          
        .attr("stroke-width", width)
        .attr("stroke", color)
        .attr("marker-end", "url(#arrow-head)")
        ;
}



//arrow(grid.x[30], f[30], grid.x[30]+0.1, f[30]);

