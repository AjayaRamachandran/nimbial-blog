import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const BYTES_PER_PARAM_Q4 = 0.5;
export const RUNTIME_OVERHEAD_MULTIPLIER = 1.2;
export const PARAMS_PER_GB_Q4 = 1 / (BYTES_PER_PARAM_Q4 * RUNTIME_OVERHEAD_MULTIPLIER);

export const iphoneRamData = [
  {
    year: 2022,
    baseModel: "iPhone 14 / 14 Plus",
    highEndModel: "iPhone 14 Pro / Pro Max",
    baseRamGB: 6,
    highEndRamGB: 6,
  },
  {
    year: 2023,
    baseModel: "iPhone 15 / 15 Plus",
    highEndModel: "iPhone 15 Pro / Pro Max",
    baseRamGB: 6,
    highEndRamGB: 8,
  },
  {
    year: 2024,
    baseModel: "iPhone 16 lineup",
    highEndModel: "iPhone 16 Pro / Pro Max",
    baseRamGB: 8,
    highEndRamGB: 8,
  },
  {
    year: 2025,
    baseModel: "iPhone 17",
    highEndModel: "iPhone Air / 17 Pro / Pro Max",
    baseRamGB: 8,
    highEndRamGB: 12,
  },
].map((point) => ({
  ...point,
  baseParamsB: Number((point.baseRamGB * PARAMS_PER_GB_Q4).toFixed(1)),
  highEndParamsB: Number((point.highEndRamGB * PARAMS_PER_GB_Q4).toFixed(1)),
}));

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="llm-stats-chart-tooltip">
      <strong>{label}</strong>
      <div>
        {point.baseModel}: {point.baseRamGB}GB RAM, {point.baseParamsB}B params
      </div>
      <div>
        {point.highEndModel}: {point.highEndRamGB}GB RAM, {point.highEndParamsB}
        B params
      </div>
    </div>
  );
}

function IPhoneParamCapacityGraph() {
  return (
    <figure className="llm-stats-chart">
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={iphoneRamData} margin={{ top: 20, right: 24, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis dataKey="year" type="category" />
          <YAxis
            domain={[0, 22]}
            label={{
              value: "Estimated parameter capacity (B)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            tickFormatter={(value) => `${value}B`}
            type="number"
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Line
            dataKey="baseParamsB"
            dot={{ r: 5, strokeWidth: 2 }}
            name="Base iPhone"
            stroke="#1e74f5"
            strokeWidth={3}
            type="monotone"
          />
          <Line
            dataKey="highEndParamsB"
            dot={{ r: 5, strokeWidth: 2 }}
            name="Highest-RAM iPhone"
            stroke="#da7228"
            strokeWidth={3}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>

      <figcaption>
        Estimated Q4_K_M model-weight capacity from iPhone RAM, assuming 0.5
        bytes per parameter plus 20% runtime overhead. RAM data from{" "}
        <a href="https://9to5mac.com/2023/11/18/iphone-ram-list/">
          9to5Mac
        </a>
        ,{" "}
        <a href="https://www.macrumors.com/2024/09/09/all-iphone-16-models-have-8gb-ram/">
          MacRumors iPhone 16 reporting
        </a>
        , and{" "}
        <a href="https://www.macrumors.com/2025/09/09/iphone-17-pro-iphone-air-ram-amounts/">
          MacRumors iPhone 17 reporting
        </a>
        .
      </figcaption>
    </figure>
  );
}

export default IPhoneParamCapacityGraph;
