import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
type Props = {
  data?: Array<Record<string, unknown>>;
  dataKey?: string;
  name?: string;
  children?: ReactNode;
};
/** Only plotted series are projected. Reuse the chart's exact immutable data snapshot. */
export function chartTable(chart: ReactElement) {
  const root = chart.props as Props,
    children = Children.toArray(root.children).filter(isValidElement) as ReactElement<Props>[],
    pie = children.find((c) => Array.isArray(c.props.data)),
    rows = root.data ?? pie?.props.data ?? [],
    series = children
      .filter(
        (c) =>
          typeof c.props.dataKey === "string" &&
          c.props.dataKey !== "name" &&
          c.props.dataKey !== "value" &&
          typeof c.props.name === "string",
      )
      .map((c) => ({ key: c.props.dataKey!, name: c.props.name! }));
  const keys = series.length
    ? series
    : children
        .filter(
          (c) =>
            typeof c.props.dataKey === "string" &&
            c.props.dataKey !== "name" &&
            !["XAxis", "YAxis"].includes((c.type as { displayName?: string }).displayName ?? ""),
        )
        .map((c) => ({
          key: c.props.dataKey!,
          name: c.props.dataKey === "value" ? "Titles" : c.props.dataKey!,
        }));
  return {
    rows,
    columns: [
      { key: "name", name: "Category" },
      ...keys.filter((c, i, a) => a.findIndex((x) => x.key === c.key) === i),
    ],
  };
}
