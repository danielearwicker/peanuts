import { readFileSync } from "fs";

export const fragment = readFileSync(__dirname + '/fragment.hlsl', 'utf8');

export const vertex = readFileSync(__dirname + '/vertex.hlsl', 'utf8');
