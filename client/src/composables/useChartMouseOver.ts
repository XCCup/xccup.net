import { Chart } from "chart.js";

let chartReference: Chart;

function simulateMouseOver(position: number = 0) {
  const meta = chartReference.getDatasetMeta(0);
  const rect = chartReference.canvas.getBoundingClientRect();
  const { x, y } = meta.data[0];

  console.log("x:", meta.data[0].x);
  console.log("MO pos:", position);

  const evt = new MouseEvent("mousemove", {
    clientX: rect.left + x + position,
    clientY: rect.top + y,
  });
  const node = chartReference.canvas;
  node.dispatchEvent(evt);
}

export default () => {
  const initChartMouseOver = (chart: Chart) => {
    chartReference = chart;
    simulateMouseOver();
  };

  return { initChartMouseOver, simulateMouseOver };
};
