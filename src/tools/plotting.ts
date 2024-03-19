

export function addLinePlot(x: number[], y: number[], options: { height?: number, color?:string} = {}) 
{
    var container = document.createElement("div");
    container.className = "line-plot";
    document.body.append(container);

    var height = options.height ?? 200;
    var width = container.clientWidth;
    var color = options.color ?? "var(--text)";

    
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height*2}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height*2}`);
    svg.style.display = "block";

    function mapx(x: number) {
        return x * width;
    }

    function mapy(y: number) {
        return height - y * height;
    }

    function mapxy(x: number, y: number) {
        return `${mapx(x)},${mapy(y)}`;
    }

    function getLineDef(x: number[], y: number[]) {
        var lineDef = x.map((x, i) => `L ${mapxy(x, y[i])}`).join(" ");
        return `M ${mapxy(0,0)} ${lineDef} L ${mapxy(1,0)}`
    }

    var graphLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    graphLine.setAttribute("fill", "none");
    graphLine.setAttribute("stroke", color);
    graphLine.setAttribute("stroke-width", "2");
    graphLine.setAttribute("d", getLineDef(x,y));

    svg.appendChild(graphLine);
    container.appendChild(svg);

    document.body.append(container);

    return {
        container: container,
        svg: svg,
        line: graphLine,

        update: function(x: number[], y: number[]) {
            graphLine.setAttribute("d", getLineDef(x,y));
        },

        addMarker: function(x: number, y: number, color: string) {
            var marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            marker.setAttribute("cx", `${mapx(x)}`);
            marker.setAttribute("cy", `${mapy(y)}`);
            marker.setAttribute("r", `5`);
            marker.setAttribute("fill", color);
            svg.appendChild(marker);

            return {
                svg: svg,
                marker: marker,

                remove: () => {
                    svg.removeChild(marker);
                },

                update: (x: number, y: number, color: string) => {
                    marker.setAttribute("cx", `${mapx(x)}`);
                    marker.setAttribute("cy", `${mapy(y)}`);
                    marker.setAttribute("r", `5`);
                    marker.setAttribute("fill", color);
                }
            }
        },

        addVertical: function(x: number, color: string) {
            var vertical = document.createElementNS("http://www.w3.org/2000/svg", "line");
            vertical.setAttribute("stroke", color);
            vertical.setAttribute("stroke-width", "1");
            vertical.setAttribute("x1", mapx(x).toString());
            vertical.setAttribute("y1", mapy(-1).toString());
            vertical.setAttribute("x2", mapx(x).toString());
            vertical.setAttribute("y2", mapy(1).toString());
            svg.insertAdjacentElement("afterbegin", vertical);
        },

        addClickListener: function(handler: LineClickHandler) {
            svg.addEventListener("click", (event) => {
                let x = event.offsetX / svg.clientWidth;
                let y = 1 - 2 * event.offsetY / svg.clientHeight;
                handler({ 
                    x: x,
                    y: y,
                });
            })
        }
    }
}

type AnimatedPlotFunction = (t: number) => number[];
type LineClickHandler = (event: { x: number, y: number }) => any

export function addAnimatedLinePlot(x: number[], y: AnimatedPlotFunction, options: { height?: number, color?:string} = {}) {
    let t = 0;
    let dt = 0.02;
    let delay = 1000 * dt;

    var plot = addLinePlot(x, y(t), options);

    setInterval(() => {
        t += dt;
        plot.update(x, y(t));
    }, delay);
}

export function addBarPlot(values: number[], labels: string[], options: {height?: number, color?: string} = {})
{

    var container = document.createElement("div");
    container.className = "bar-plot";
    document.body.append(container);

    var height = options.height ?? 200;
    var width = container.clientWidth;
    var color = options.color ?? "var(--text)";
    
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height*2}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height*2}`);
    svg.style.display = "block";

    function mapx(x: number) {
        return x * width;
    }

    function mapy(y: number) {
        return height - y * height;
    }

    let range = [...Array(values.length).keys()];
    let dx = width / (range.length)
    let positions = range.map(i => (i) * dx);

    let rects = values.map((v, i) => {
        let r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", `${positions[i] + dx / 4}`);
        r.setAttribute("width", `${dx/2}`);
        r.setAttribute("fill", color);
        svg.append(r);

        return r;
    });

    let labelElems = labels.map((label, i) => {
        let l = document.createElementNS("http://www.w3.org/2000/svg", "text")
        l.setAttribute("x", `${positions[i] + dx / 2}`)
        l.setAttribute("y", `${height + 30}`)
        l.setAttribute("fill", color);
        l.setAttribute("text-anchor", "middle");
        l.textContent = label;

        svg.append(l);
    });

    container.append(svg);

    function update(values: number[]) {
        values.forEach((v, i) => {
            let r = rects[i];
            if (v >= 0) {
                r.setAttribute("y", `${mapy(v)}`);
            }
            else {
                r.setAttribute("y", `${height}`);
            }
            r.setAttribute("height", `${Math.abs(v)*height}`)
        });
    }

    return {
        update: update 
    }
}