import { createRegularGrid } from "../tools/grid";
import { StepperFunctions, StepperMath, addStepperKeyboardBinding } from "../tools/stepper";
import { addLinePlot } from "../tools/plotting";
import * as d3 from 'd3';
import { addHeader, addMath, addMathText } from "../tools/math";

let width = document.body.clientWidth-100;
let height = width * 2 / 3  
let margin = 0

let xMapping = d3.scaleLinear().domain([0,1]).range([margin, width-margin]);
let yMapping = d3.scaleLinear().domain([-1,1]).range([margin, height-margin]);


let grid = createRegularGrid(0, 1, 128);
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
    .style("margin", "auto")
    .attr("viewBox", `${-margin} ${-margin} ${width+2*margin} ${height+2*margin}`)
    ;

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
    .attr("stroke", "var(--text)")
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
        .attr("fill", "green")
        .attr("d", "M 0 0 L 10 5 L 0 10 z");

let i1 = grid.x.findIndex(x => x >= 0.35)
let x1 = grid.x[i1];
let f1 = f[i1]
let diff1 = (f[i1+1] - f[i1-1]) / (grid.dx*2)


let i2 = grid.x.findIndex(x => x >= 0.38)
let x2 = grid.x[i2];
let f2 = f[i2]
let diff2 = (f[i2+1] - f[i2-1]) / (grid.dx*2);


function highlightSegment() {
    addLine(x1, f1, x1, 1, "var(--text)", 1, true);
    addLine(x2, f2, x2, 1, "var(--text)", 1, true);
    addLine(x1, f1, x2, f2, "brown", 5);

    viewport.append("text")
        .attr("x", xMapping((x1 + x2)/2 - 0.005))
        .attr("y", yMapping(0.9))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "Δx")}

function plotDerivatives() {
    arrow(x1, f1, x1 - 0.1, f1 - 0.1 * diff1, "red");
    arrow(x2, f2, x2 + 0.1, f2 + 0.1 * diff2, "red");
}

function plotDerivativeDecompositionsX() {
    arrow(x1, f1, x1 - 0.1, f1, "green");
    viewport.append("text")
        .attr("x", xMapping(x1-0.115))
        .attr("y", yMapping(f1+0.010))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "-Fₓ")

    
    arrow(x2, f2, x2 + 0.1, f2, "green");
    viewport.append("text")
        .attr("x", xMapping(x2+0.11))
        .attr("y", yMapping(f2+0.010))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "Fₓ")

}


function plotDerivativeDecompositionsY() {
    arrow(x1, f1, x1, f1 - 0.1 * diff1, "green");

    viewport.append("path")
            .attr("d", `M ${xMapping(x1 - 0.05)}, ${yMapping(f1)} A 50 50, 0, 0, 0, ${xMapping(x1 - 0.05)}, ${yMapping(f1 - 0.05 * diff1)}`)
            .attr("fill", "none")
            .attr("stroke", "var(--text)")

    viewport.append("text")
        .attr("x", xMapping(x1-0.07))
        .attr("y", yMapping(f1+0.03))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "θ₁")

    viewport.append("text")
        .attr("x", xMapping(x1-0.009))
        .attr("y", yMapping(f1-0.10 * diff1 + 0.04))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "F₁")

    
    arrow(x2, f2, x2, f2 + 0.1 * diff2, "green");

    viewport.append("path")
            .attr("d", `M ${xMapping(x2 + 0.05)}, ${yMapping(f2)} A 50 50, 0, 0, 0, ${xMapping(x2 + 0.05)}, ${yMapping(f2 + 0.05 * diff2)}`)
            .attr("fill", "none")
            .attr("stroke", "var(--text)")

    viewport.append("text")
        .attr("x", xMapping(x2+0.07))
        .attr("y", yMapping(f2-0.03))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "θ₂")

    viewport.append("text")
        .attr("x", xMapping(x2-0.005))
        .attr("y", yMapping(f2+0.10 * diff2 - 0.01))
        .attr("style", "font-size: 0.75em")
        .attr("fill", "var(--text)")
        .text(() => "F₂")

}


function zoomToSegment() {
    var centerX = (x1 + x2) / 2
    var centerY = (f1 + f2) / 2
    var scale = 2.5

    d3.transition().duration(2500).call(
        zoom.transform,
        d3.zoomIdentity.translate(width/2, height/2).scale(scale).translate(xMapping(-centerX),-yMapping(centerY))
    )
}

function addLine(x0, y0, x1, y1, color = "var(--text)", width = 1, dashed = false)
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

function arrow(x0, y0, x1, y1, color = "var(--text)", width = 1)
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
export function slide2() {
    addHeader("Consider the forces on a guitar string")

    let stepper = new StepperFunctions([
        () => document.body.append(svg.node()),
        () => highlightSegment(),
        () => zoomToSegment(),
        () => plotDerivatives(),
        () => addMathText("Assume no horizontal movement (small amplitutes)"),
        () => plotDerivativeDecompositionsX(),
        () => plotDerivativeDecompositionsY(),
        
        () => new StepperMath([
            `
            F_1= - F_x \\tan \\theta_1
            `,
            `
            F_1 = - F_x \\tan \\theta_1 = - F_x \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1}
            `,
            `
            F_1 = - \\tan \\theta_1 = - F_x \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1},
            F_2 = F_x \\tan \\theta_2 = F_x \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_2}
            `,
        ]),
        () => new StepperMath([
            `F_{total} = F_2 + F_1`,
            `F_{total} = F_2 + F_1 = F_x \\left[ \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_2} - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1}  \\right]`
        ], "(I)"),

        () => addMathText("Motion is described by Newtons law"),
    
        () => new StepperMath([
            `F_{total} = m a`,
            `F_{total} = m a = \\mu \\Delta x \\frac{\\partial^2 f}{\\partial t^2}`,
        ], "(II)"),
    
    
        () => new StepperMath([`
            \\frac{F_x}{\\mu} \\frac{\\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1 + \\Delta x} - \\left( \\frac{\\partial f}{\\partial x} \\right)_{x_1} }{\\Delta x} 
            = \\frac{\\partial^2 f}{\\partial t^2}
        `]),
    
        () => new StepperMath([`
            \\frac{F_x}{\\mu} \\frac{\\partial^2 f}{\\partial x^2} = \\frac{\\partial^2 f}{\\partial t^2}
        `]),

        () => new addMathText("a.k.a. the linear wave equation"),
    ]);
    
    addStepperKeyboardBinding(stepper);
    
}
