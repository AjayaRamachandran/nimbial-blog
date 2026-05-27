import React, { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { paramMeanData } from "@/components/LLMStatsOpenModelsGraph";
import { iphoneRamData } from "@/components/IPhoneParamCapacityGraph";

const BASE_DATE = new Date("2025-09-01T00:00:00Z");

function monthsSinceBase(timestamp) {
  const date = new Date(timestamp);
  return (
    (date.getUTCFullYear() - BASE_DATE.getUTCFullYear()) * 12 +
    date.getUTCMonth() -
    BASE_DATE.getUTCMonth()
  );
}

function formatProjectionMonth(monthIndex) {
  const date = new Date(BASE_DATE);
  date.setUTCMonth(BASE_DATE.getUTCMonth() + Math.round(monthIndex));

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function exponentialRegression(points) {
  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumLogY = points.reduce((sum, point) => sum + Math.log(point.y), 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumXLogY = points.reduce(
    (sum, point) => sum + point.x * Math.log(point.y),
    0,
  );
  const growthRate = (n * sumXLogY - sumX * sumLogY) / (n * sumXX - sumX * sumX);
  const logInitialValue = (sumLogY - growthRate * sumX) / n;

  return {
    initialValue: Math.exp(logInitialValue),
    growthRate,
    valueAt: (x) => Math.exp(logInitialValue + growthRate * x),
  };
}

const modelRegression = exponentialRegression(
  paramMeanData.map((point) => ({
    x: monthsSinceBase(point.releasedAt),
    y: point.paramMeanB,
  })),
);

const highEndIPhoneRegression = exponentialRegression(
  iphoneRamData.map((point) => ({
    x: (point.year - BASE_DATE.getUTCFullYear()) * 12,
    y: point.highEndParamsB,
  })),
);

const intersectionX =
  (Math.log(highEndIPhoneRegression.initialValue) -
    Math.log(modelRegression.initialValue)) /
  (modelRegression.growthRate - highEndIPhoneRegression.growthRate);
const intersectionY = modelRegression.valueAt(intersectionX);
const projectionData = Array.from({ length: 19 }, (_, monthIndex) => ({
  monthIndex,
  monthLabel: formatProjectionMonth(monthIndex),
  requiredParamsB: Number(modelRegression.valueAt(monthIndex).toFixed(1)),
  iphoneParamsB: Number(highEndIPhoneRegression.valueAt(monthIndex).toFixed(1)),
}));

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="llm-stats-chart-tooltip">
      <strong>{formatProjectionMonth(label)}</strong>
      {payload.map((item) => (
        <div key={item.dataKey}>
          {item.name}: {item.value}B params
        </div>
      ))}
    </div>
  );
}

function IPhoneIntersectionProjectionGraph() {
  const [isLogScale, setIsLogScale] = useState(true);
  const yAxisProps = isLogScale
    ? {
        domain: [10, 3000],
        label: "Estimated parameters (B, log scale)",
        scale: "log",
        ticks: [10, 30, 100, 300, 1000, 3000],
      }
    : {
        domain: [0, 2600],
        label: "Estimated parameters (B)",
      };

  return (
    <figure className="llm-stats-chart">
      <div className="llm-stats-chart-controls" aria-label="Y-axis scale">
        <button
          aria-pressed={!isLogScale}
          className={!isLogScale ? "active" : ""}
          onClick={() => setIsLogScale(false)}
          type="button"
        >
          Linear
        </button>
        <button
          aria-pressed={isLogScale}
          className={isLogScale ? "active" : ""}
          onClick={() => setIsLogScale(true)}
          type="button"
        >
          Log
        </button>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={projectionData}
          margin={{ top: 20, right: 24, bottom: 24, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis
            dataKey="monthIndex"
            interval={2}
            tickFormatter={formatProjectionMonth}
            type="number"
          />
          <YAxis
            key={isLogScale ? "log" : "linear"}
            domain={yAxisProps.domain}
            label={{
              value: yAxisProps.label,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            scale={yAxisProps.scale}
            ticks={yAxisProps.ticks}
            tickFormatter={(value) => `${value}B`}
            type="number"
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Line
            dataKey="requiredParamsB"
            dot={false}
            name="Score-50 model size fit"
            stroke="#da7228"
            strokeWidth={3}
            type="monotone"
          />
          <Line
            dataKey="iphoneParamsB"
            dot={false}
            name="Highest-RAM iPhone fit"
            stroke="#1e74f5"
            strokeWidth={3}
            type="monotone"
          />
          <ReferenceDot
            fill="#fff"
            label={{
              value: `${formatProjectionMonth(intersectionX)}: ${intersectionY.toFixed(1)}B`,
              position: "top",
            }}
            r={6}
            stroke="#111"
            strokeWidth={2}
            x={intersectionX}
            y={intersectionY}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* <figcaption>
        Exponential regression on the 50-score parameter mean and highest-RAM
        iPhone capacity estimates. The fitted lines intersect around{" "}
        {formatProjectionMonth(intersectionX)}, at about {intersectionY.toFixed(1)}
        B Q4 parameters.
      </figcaption> */}
    </figure>
  );
}

export default IPhoneIntersectionProjectionGraph;
