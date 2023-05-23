import { Color } from "@tremor/react";

export const dashboardStatColors: { [key: string]: Color } = {
  increase: "emerald",
  moderateIncrease: "emerald",
  unchanged: "orange",
  moderateDecrease: "rose",
  decrease: "rose",
};

export const regex = {
  number: /^[0-9\b]+$/,
};
