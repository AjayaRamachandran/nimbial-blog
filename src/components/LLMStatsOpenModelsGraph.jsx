import React from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const modelData = [
  {
    model: "Kimi K2-Thinking-0905",
    date: "2025-09-01",
    releasedMonth: "Sep. 2025",
    paramsB: 1000,
    score: 45.7,
  },
  {
    model: "GLM-4.6",
    date: "2025-09-01",
    releasedMonth: "Sep. 2025",
    paramsB: 357,
    score: 38.0,
  },
  {
    model: "GLM-4.7",
    date: "2025-12-01",
    releasedMonth: "Dec. 2025",
    paramsB: 358,
    score: 44.2,
  },
  {
    model: "DeepSeek-V3.2-Speciale",
    date: "2025-12-01",
    releasedMonth: "Dec. 2025",
    paramsB: 685,
    score: 42.7,
  },
  {
    model: "MiniMax M2.1",
    date: "2025-12-01",
    releasedMonth: "Dec. 2025",
    paramsB: 230,
    score: 41.3,
  },
  {
    model: "MiMo-V2-Flash",
    date: "2025-12-01",
    releasedMonth: "Dec. 2025",
    paramsB: 309,
    score: 38.8,
  },
  {
    model: "Kimi K2.5",
    date: "2026-01-01",
    releasedMonth: "Jan. 2026",
    paramsB: 1000,
    score: 50.3,
  },
  {
    model: "Qwen3.5 397B",
    date: "2026-02-01",
    releasedMonth: "Feb. 2026",
    paramsB: 397,
    score: 49.5,
  },
  {
    model: "Step-3.5-Flash",
    date: "2026-02-01",
    releasedMonth: "Feb. 2026",
    paramsB: 196,
    score: 49.5,
  },
  {
    model: "GLM-5",
    date: "2026-02-01",
    releasedMonth: "Feb. 2026",
    paramsB: 744,
    score: 51.8,
  },
  {
    model: "MiniMax M2.5",
    date: "2026-02-01",
    releasedMonth: "Feb. 2026",
    paramsB: 230,
    score: 52.8,
  },
  {
    model: "Qwen3.5-122B-A10B",
    date: "2026-02-01",
    releasedMonth: "Feb. 2026",
    paramsB: 122,
    score: 43.3,
  },
  {
    model: "Qwen3.5-27B",
    date: "2026-02-01",
    releasedMonth: "Feb. 2026",
    paramsB: 27,
    score: 42.3,
  },
  {
    model: "DeepSeek-V4-Flash-Max",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 284,
    score: 52.1,
  },
  {
    model: "Qwen3.6-27B",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 27.8,
    score: 45.7,
  },
  {
    model: "Gemma 4 31B",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 30.7,
    score: 45.2,
  },
  {
    model: "GLM-5.1",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 754,
    score: 54.9,
  },
  {
    model: "DeepSeek-V4-Pro-Max",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 1600,
    score: 57.3,
  },
  {
    model: "Kimi K2.6",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 1000,
    score: 58.8,
  },
  {
    model: "Gemma 4 26B-A4B",
    date: "2026-04-01",
    releasedMonth: "Apr. 2026",
    paramsB: 25.2,
    score: 36.6,
  },
].map((point) => ({
  ...point,
  releasedAt: new Date(`${point.date}T00:00:00Z`).getTime(),
}));

export const paramMeanData = Object.values(
  modelData.reduce((groups, point) => {
    const currentGroup = groups[point.releasedAt] ?? {
      releasedAt: point.releasedAt,
      releasedMonth: point.releasedMonth,
      modelCount: 0,
      scaledParamSum: 0,
    };

    currentGroup.modelCount += 1;
    currentGroup.scaledParamSum += Math.exp(Math.log(point.paramsB) * (50 / point.score));
    groups[point.releasedAt] = currentGroup;

    return groups;
  }, {}),
)
  .map((point) => ({
    ...point,
    paramMeanB: Number((point.scaledParamSum / point.modelCount).toFixed(1)),
  }))
  .map((point) => ({
    ...point,
    paramsB: point.paramMeanB,
  }))
  .filter((point) => point.modelCount > 0)
  .sort((a, b) => a.releasedAt - b.releasedAt);

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload.find((item) => item.payload.model)?.payload ?? payload[0].payload;

  return (
    <div className="llm-stats-chart-tooltip">
      <strong>{point.model ?? "50-score Param Mean"}</strong>
      <div>{point.releasedMonth}</div>
      {point.model ? (
        <>
          <div>{point.paramsB}B parameters</div>
          <div>Open leaderboard score: {point.score}</div>
        </>
      ) : (
        <>
          <div>{point.paramMeanB}B estimated for score 50</div>
          <div>{point.modelCount} models in this month</div>
        </>
      )}
    </div>
  );
}

function RawModelPoint({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} fill="rgba(30, 116, 245, 0.01)" r={13} />
      <circle cx={cx} cy={cy} fill="#1e74f5" r={5} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
}

function ParamMeanPoint({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} fill="rgba(218, 114, 40, 0.01)" r={13} />
      <circle cx={cx} cy={cy} fill="#fff" r={5} stroke="#da7228" strokeWidth={3} />
    </g>
  );
}

function LLMStatsOpenModelsGraph() {
  return (
    <figure className="llm-stats-chart">
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 20, right: 24, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis
            dataKey="releasedAt"
            domain={["dataMin", "dataMax"]}
            scale="time"
            tickFormatter={formatDate}
            type="number"
          />
          <YAxis
            dataKey="paramsB"
            label={{
              value: "Raw parameter count (B)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            tickFormatter={(value) => `${value}B`}
            type="number"
          />
          <Tooltip content={<ChartTooltip />} cursor={false} shared={false} />
          <Legend />
          <Scatter
            data={paramMeanData}
            dataKey="paramsB"
            fill="#da7228"
            line={{ stroke: "#da7228", strokeWidth: 3 }}
            lineType="joint"
            name="50-score Param Mean"
            shape={<ParamMeanPoint />}
          />
          <Scatter
            data={modelData}
            dataKey="paramsB"
            fill="#1e74f5"
            name="Raw model params"
            shape={<RawModelPoint />}
          />
        </ScatterChart>
      </ResponsiveContainer>

      <figcaption>
        Open-weight model progression from{" "}
        <a href="https://llm-stats.com/leaderboards/open-llm-leaderboard">
          LLM Stats
        </a>{" "}
        open-model data. Points are the 20 visible open models closest to a score
        of 50; the line estimates the parameter count needed for score 50 in each
        month.
      </figcaption>
    </figure>
  );
}

export default LLMStatsOpenModelsGraph;
