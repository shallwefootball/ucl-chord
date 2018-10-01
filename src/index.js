import * as d3 from "d3";
import * as fp from "lodash/fp";
import {
  getSourcePosition,
  getTargetPosition,
  getGroupPosition
} from "./utils";
import customChordLayout from "./customChordLayout";
import squad from "./squad.json";

const width = 600;
const height = 600;
const faceCircle = 15;
const opacityDefault = 0.8;

document.getElementById("app").innerHTML = `
  <svg width="${width}" height="${height}"></svg>
`;

const matrix = [
  [0, 1, 5, 3, 0, 1, 1, 1, 3, 0, 0, 0, 0, 0], // navas
  [0, 0, 0, 4, 3, 1, 1, 5, 1, 2, 2, 0, 0, 0], // carvajal
  [3, 3, 0, 11, 5, 18, 1, 6, 20, 4, 6, 5, 0, 0], // ramos
  [3, 3, 22, 0, 0, 6, 2, 9, 0, 3, 2, 3, 0, 0], // varane
  [0, 3, 3, 0, 0, 3, 3, 2, 11, 3, 2, 0, 0, 0], // ronaldo
  [1, 1, 16, 4, 8, 0, 5, 14, 17, 5, 10, 6, 1, 0], // kroos
  [0, 2, 2, 1, 4, 7, 0, 4, 6, 3, 4, 2, 0, 0], // benzema
  [0, 10, 3, 7, 2, 12, 4, 0, 5, 5, 7, 12, 2, 0], // modrić
  [1, 0, 5, 2, 17, 14, 10, 2, 0, 2, 8, 2, 2, 1], // marcelo
  [0, 0, 2, 5, 3, 8, 1, 5, 4, 0, 2, 5, 1, 1], // casemiro
  [0, 2, 5, 1, 3, 9, 7, 4, 4, 3, 0, 9, 0, 0], // isco
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
const outerRadius = Math.min(width, height) * 0.37;
const innerRadius = outerRadius;
const arcInnerRadius = outerRadius * 1.02;
const arcOuterRadius = outerRadius * 1.08;
const circleDistance = outerRadius * 1.21;

const colors = d3
  .scaleSequential(d3.interpolateRdYlBu)
  .domain([0, matrix.length]);
const chord = customChordLayout()
  .padding(0.12)
  .matrix(matrix);
const ribbon = d3.ribbon().radius(innerRadius);

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

svg
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

const circle = svg
  .append("g")
  .selectAll("circle")
  .data(chord.groups)
  .enter()
  .append("circle")
  .attr("cx", d => circleDistance * Math.cos(getGroupPosition(d)))
  .attr("cy", d => circleDistance * Math.sin(getGroupPosition(d)))
  .attr("r", faceCircle)
  .style("fill", (_, i) => {
    return `url(#img-${squad[i].name})`;
  })
  .style("stroke", ({ index }) => colors(index))
  .style("stroke-width", 2);

svg.selectAll("g").attr("transform", `translate(${width / 2},${height / 2})`);

const fade = opacity => {
  return (_, i) => {
    svg
      .selectAll("path.chord")
      .filter(d => d.source.index !== i && d.target.index !== i)
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
      .transition()
      .style("opacity", opacity);

    circle
      .filter(d => active.every(index => d.index !== index))
      .transition()
      .style("opacity", opacity);
  };
};

outerArc.on("mouseover", fade(0.1)).on("mouseout", fade(opacityDefault));
circle.on("mouseover", fade(0.1)).on("mouseout", fade(opacityDefault));
