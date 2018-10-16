import * as d3 from "d3";
import * as fp from "lodash/fp";
import * as _ from "lodash";
import {
  getSourcePosition,
  getTargetPosition,
  getGroupPosition
} from "./utils";
import customChordLayout from "./customChordLayout";
import squad from "./squad.json";

const width = 700;
const height = 600;
const faceCircle = 15;
const opacityDefault = 0.8;
const textBoxTransX = 55;

document.getElementById("app").innerHTML = `
  <svg width="${width}" height="${height}"></svg>
`;

const matrix = [
  [0, 1, 5, 3, 0, 1, 1, 1, 3, 0, 0, 0, 0, 0], // navas
  [1, 0, 5, 2, 17, 14, 10, 2, 0, 2, 8, 2, 2, 1], // marcelo
  [3, 3, 0, 11, 5, 18, 1, 6, 20, 4, 6, 5, 0, 0], // ramos
  [3, 3, 22, 0, 0, 6, 2, 9, 0, 3, 2, 3, 0, 0], // varane
  [0, 0, 0, 4, 3, 1, 1, 5, 1, 2, 2, 0, 0, 0], // carvajal
  [1, 1, 16, 4, 8, 0, 5, 14, 17, 5, 10, 6, 1, 0], // kroos
  [0, 0, 2, 5, 3, 8, 1, 5, 4, 0, 2, 5, 1, 1], // casemiro
  [0, 10, 3, 7, 2, 12, 4, 0, 5, 5, 7, 12, 2, 0], // modrić
  [0, 2, 5, 1, 3, 9, 7, 4, 4, 3, 0, 9, 0, 0], // isco
  [0, 3, 3, 0, 0, 3, 3, 2, 11, 3, 2, 0, 0, 0], // ronaldo
  [0, 2, 2, 1, 4, 7, 0, 4, 6, 3, 4, 2, 0, 0], // benzema
  [1, 0, 1, 9, 0, 2, 2, 11, 0, 4, 7, 0, 4, 0], // nacho
  [0, 0, 1, 0, 0, 1, 1, 2, 0, 1, 0, 1, 0, 0], // bale
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // asensio
];

// const matrix = [
//   [0, 3, 3, 2, 5, 2],
//   [4, 0, 3, 2, 4, 3],
//   [3, 3, 0, 2, 3, 3],
//   [2, 2, 2, 0, 3, 3],
//   [5, 4, 3, 3, 0, 2],
//   [2, 3, 3, 3, 2, 0]
// ];

const svg = d3.select("svg");
const arc = d3.arc();
const outerRadius = Math.min(width, height) * 0.38;
const innerRadius = outerRadius;
const arcInnerRadius = outerRadius * 1.03;
const arcOuterRadius = outerRadius * 1.08;
const circleDistance = outerRadius * 1.21;

const colors = d3
  .scaleSequential(d3.interpolateRdYlBu)
  .domain([0, matrix.length]);
const chord = customChordLayout()
  .padding(0.09)
  .matrix(matrix);
const ribbon = d3.ribbon().radius(innerRadius);

svg.style("padding", "1em 4em");

const grads = svg
  .append("defs")
  .selectAll("linearGradient")
  .data(chord.chords)
  .enter()
  .append("linearGradient")
  .attr("id", d => `chordGradient-${d.source.index}-${d.target.index}`)
  .attr("gradientUnits", "userSpaceOnUse")
  .attr("x1", d => innerRadius * Math.cos(getSourcePosition(d)))
  .attr("y1", d => innerRadius * Math.sin(getSourcePosition(d)))
  .attr("x2", d => innerRadius * Math.cos(getTargetPosition(d)))
  .attr("y2", d => innerRadius * Math.sin(getTargetPosition(d)));

grads
  .append("stop")
  .attr("offset", "0%")
  .attr("stop-color", d => colors(d.source.index));

grads
  .append("stop")
  .attr("offset", "100%")
  .attr("stop-color", d => colors(d.target.index));

const passPath = svg
  .append("g")
  .selectAll("path")
  .data(chord.chords)
  .enter()
  .append("path")
  .attr("class", "chord")
  .style("fill", d => `url(#chordGradient-${d.source.index}-${d.target.index})`)
  .style("opacity", opacityDefault)
  .attr("d", ribbon);

const outerArc = svg
  .append("g")
  .selectAll("path")
  .data(chord.groups)
  .enter()
  .append("path")
  .attr("class", "outer-arc")
  .style("fill", ({ index }) => colors(index))
  .attr("d", source =>
    arc({
      ...source,
      innerRadius: arcInnerRadius,
      outerRadius: arcOuterRadius
    })
  );

const face = svg
  .append("defs")
  .selectAll("pattern")
  .data(squad)
  .enter()
  .append("pattern")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", 1)
  .attr("width", 1)
  .attr("id", d => {
    return `img-${d.name}`;
  })
  .append("image")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", 2 * faceCircle)
  .attr("width", 2 * faceCircle)
  .attr("xlink:href", d => {
    return d.img;
  });

const circleWrapper = svg
  .append("g")
  .selectAll("g")
  .data(chord.groups)
  .enter()
  .append("g");

const circle = circleWrapper
  .append("circle")
  .attr("r", faceCircle)
  .attr("cx", d => circleDistance * Math.cos(getGroupPosition(d)))
  .attr("cy", d => circleDistance * Math.sin(getGroupPosition(d)))
  .style("fill", (_, i) => {
    return `url(#img-${squad[i].name})`;
  })
  .style("stroke-opacity", opacityDefault)
  .style("stroke", ({ index }) => colors(index))
  .style("stroke-width", 2);

const textWrapper = svg
  .append("g")
  .selectAll("g")
  .data(chord.groups)
  .enter()
  .append("g")
  .attr(
    "transform",
    d =>
      `translate(${circleDistance * Math.cos(getGroupPosition(d)) +
        textBoxTransX}, ${circleDistance * Math.sin(getGroupPosition(d)) - 18})`
  )
  .attr("display", "none");

const box = textWrapper.append("g");

box
  .append("path")
  .attr("d", "M0 14L7 10L7 18L0 14Z")
  .attr("fill", ({ index }) => colors(index));
const boxRect = box
  .append("rect")
  .attr("x", 6)
  .attr("height", 56)
  .attr("width", 74)
  .attr("rx", 12)
  .attr("fill", ({ index }) => colors(index));

const tpr = textWrapper
  .append("text")
  .attr("font-family", "sans-serif")
  .attr("font-size", 7)
  .attr("x", 18)
  .attr("y", 15)
  .text("*TPR")
  .attr("fill", "white");

const playerTotalPasses = textWrapper
  .append("text")
  .attr("font-family", "sans-serif")
  .attr("text-anchor", "end")
  .attr("font-size", 28)
  .attr("x", 70)
  .attr("y", 30)
  .text((d, i) => {
    return squad[i].totalPasses;
  })
  .attr("fill", "white");

const playerName = textWrapper
  .append("text")
  .attr("font-family", "sans-serif")
  .attr("font-size", 11)
  .attr("text-anchor", "end")
  .attr("x", 70)
  .attr("y", 44)
  .text((d, i) => {
    return squad[i].name;
  })
  .attr("fill", "white");

svg
  .selectAll("svg > g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

const hover = isHover => {
  return (__, i) => {
    const opacity = isHover ? 0.1 : opacityDefault;
    const scale = isHover ? 1.8 : 1;

    svg
      .selectAll("path.chord")
      .filter(d => d.source.index !== i && d.target.index !== i)
      .interrupt()
      .transition()
      .style("opacity", opacity);
    // outerArc
    const active = fp.flow(
      fp.filter(d => d.source.index === i || d.target.index === i),
      fp.map(d => [d.source.index, d.target.index]),
      fp.flatten,
      fp.union(() => {})
    )(chord.chords());

    outerArc
      .filter(d => active.every(index => d.index !== index))
      .interrupt()
      .transition()
      .style("opacity", opacity);

    circleWrapper
      .filter(d => active.every(index => d.index !== index))
      .transition()
      .style("opacity", () => (isHover ? 0.1 : 1));

    circle
      .filter(d => d.index === i)
      .transition()
      .attr("transform", d => {
        const cx = circleDistance * Math.cos(getGroupPosition(d));
        const cy = circleDistance * Math.sin(getGroupPosition(d));
        const scaleCX = cx - cx / scale;
        const scaleCY = cy - cy / scale;

        return `scale(${scale}) translate(${-scaleCX}, ${-scaleCY})`;
      });

    textWrapper
      .filter(d => d.index === i)
      .transition()
      .attr("transform", d => {
        const cx = circleDistance * Math.cos(getGroupPosition(d));
        const cy = circleDistance * Math.sin(getGroupPosition(d));
        return isHover
          ? `translate(${cx + (textBoxTransX - 20)}, ${cy - 18})`
          : `translate(${cx + textBoxTransX}, ${cy - 18})`;
      })
      .attr("display", isHover ? "auto" : "none")
      .style("opacity", isHover ? 1 : 0);
  };
};

outerArc.on("mouseenter", hover(true)).on("mouseleave", hover(false));
circle.on("mouseenter", hover(true)).on("mouseleave", hover(false));

const pathHover = isHover => {
  const opacity = isHover ? 0.1 : opacityDefault;
  return k => {
    svg
      .selectAll("path.chord")
      .filter(
        d =>
          !(
            k.source.index === d.source.index &&
            k.target.index === d.target.index
          )
      )
      .transition()
      .duration(200)
      .style("opacity", opacity);

    outerArc
      .filter(d =>
        [k.source.index, k.target.index].every(index => d.index !== index)
      )
      .interrupt()
      .transition()
      .style("opacity", opacity);

    circle
      .filter(d =>
        [k.source.index, k.target.index].every(index => d.index !== index)
      )
      .transition()
      .style("opacity", () => (isHover ? 0.1 : 1));
  };
};

passPath.on("mouseenter", pathHover(true)).on("mouseleave", pathHover(false));
