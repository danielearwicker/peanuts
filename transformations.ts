import { Matrix } from "ml-matrix";

export const projection = (fudgeFactor: number) => new Matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, fudgeFactor],
    [0, 0, 0, 1],
]);

const rotate = (a: number, matrix: (c: number, s: number) => number[][]) => 
    new Matrix(matrix(Math.sin(a), Math.cos(a)));

export const rotateX = (a: number) => rotate(a, (s, c) => [
    [1, 0, 0, 0],
    [0, c, s, 0],
    [0, -s, c, 0],
    [0, 0, 0, 1],
]);

export const rotateY = (a: number) => rotate(a, (s, c) => [
    [c, 0, -s, 0],
    [0, 1, 0, 0],
    [s, 0, c, 0],
    [0, 0, 0, 1],
]);

export const rotateZ = (a: number) => rotate(a, (s, c) => [
    [c, s, 0, 0],
    [-s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
]);

export const scale = (x: number, y: number, z: number) => new Matrix([
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1]
]);

export const translate = (x: number, y: number, z: number) => new Matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [x, y, z, 1]
]);
