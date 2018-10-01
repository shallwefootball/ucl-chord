export const getSourcePosition = d =>
  (d.source.endAngle - d.source.startAngle) / 2 +
  d.source.startAngle -
  Math.PI / 2;

export const getTargetPosition = d =>
  (d.target.endAngle - d.target.startAngle) / 2 +
  d.target.startAngle -
  Math.PI / 2;

export const getGroupPosition = source =>
  (source.endAngle - source.startAngle) / 2 + source.startAngle - Math.PI / 2;
