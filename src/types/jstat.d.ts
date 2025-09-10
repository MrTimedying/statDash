// Type declarations for jStat library
declare module 'jstat' {
  export interface Distribution {
    sample(...args: any[]): number;
    cdf(x: number, ...args: any[]): number;
    inv(p: number, ...args: any[]): number;
  }

  export const normal: Distribution;
  export const studentt: Distribution;

  export function mean(array: number[]): number;
  export function variance(array: number[], flag?: boolean): number;
  export function stdev(array: number[], flag?: boolean): number;
  export function sum(array: number[]): number;
  export function min(array: number[]): number;
  export function max(array: number[]): number;

  // Add other functions as needed
  export function ttest(sample1: number[], sample2: number[], flag?: number): {
    t: number;
    p: number;
    df: number;
  };
}