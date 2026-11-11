import React from "react";

// Wraps a Recharts chart in its <figure> and adds the chart's numbers as
// tables. The tables are hidden from view but stay in the page, so search
// engines, AI tools and screen readers can read what the chart shows.
//
// tables: [{ caption?, columns: [header, ...], rows: [[cell, ...], ...] }]
// summary: optional sentence stating the chart's takeaway
function ChartFigure({ tables = [], summary, children }) {
  return (
    <figure className="llm-stats-chart">
      {children}
      <div className="chart-data">
        {summary && <p>{summary}</p>}
        {tables.map(({ caption, columns, rows }, tableIndex) => (
          <table key={tableIndex}>
            {caption && <caption>{caption}</caption>}
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </figure>
  );
}

export default ChartFigure;
