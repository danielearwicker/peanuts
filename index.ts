import { 
    createShader, 
    createProgram,
    resizeCanvasToDisplaySize
} from "./glUtil";

import { projection, rotateX, rotateY, rotateZ, scale, translate } from "./transformations";
import Matrix, { Matrix as Matrix2, inverse } from "ml-matrix";

import { vertex, fragment } from "./shaders";

const canvas = document.querySelector("canvas")!;

const gl = canvas.getContext("webgl")!;
if (!gl) {
    throw new Error("No webgl support");
}

const program = createProgram(gl, [
    createShader(gl, gl.VERTEX_SHADER, vertex),
    createShader(gl, gl.FRAGMENT_SHADER, fragment)
]);

type Vertex = [x: number, y: number, z: number];
type Colour = [r: number, g: number, b: number, a: number];
    
const white: Colour = [255, 255, 255, 255];

function geometry() {
    const positions: number[] = [];
    const colours: number[] = [];
    
    function clear() {
        positions.length = 0;
        colours.length = 0;
    }

    function triangle(a: Vertex, b: Vertex, c: Vertex, colour: Colour) {
        positions.push(...a, ...b, ...c);
        colours.push(...colour, ...colour, ...colour);
    }
    
    function quadrilateral(a: Vertex, b: Vertex, c: Vertex, d: Vertex, colour: Colour) {
        triangle(a, b, c, colour);
        triangle(c, a, d, colour);
    }    

    function add(a: Vertex, b: Vertex): Vertex {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }

    const faces = [
        [0, 1, 2],
        [1, 0, 2],
        [1, 2, 0],
    ] as const;

    const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [1, 1],
        [-1, -1],
        [-1, 1]
    ] as const;

    function cube(centre: Vertex, size: number, colour: Colour) {
        size /= 2;

        for (const face of faces) {
            for (let side = -1; side <= 1; side += 2) {
                for (let c = 0; c < 6; c++) {
                    const corner = corners[c];                    
                    const v: Vertex = [size * side, size * corner[0], size * corner[1]];
                    positions.push(...add(centre, [v[face[0]], v[face[1]], v[face[2]]]));
                    colours.push(...colour);
                }
            }
        }
    }

    function crosshair(centre: Vertex, size: number, colour: Colour) {
        size /= 2;

        quadrilateral(
            [-1, -1, centre[2]],
            [1, -1, centre[2]],
            [1, 1, centre[2]],
            [-1, 1, centre[2]],
            colour);

        quadrilateral(
            [-1, centre[1], -1],
            [1, centre[1], -1],
            [1, centre[1], 1],
            [-1, centre[1], 1],
            colour);

        quadrilateral(
            [centre[0], -1, -1],
            [centre[0], 1, -1],
            [centre[0], 1, 1],
            [centre[0], -1, 1],
            colour);
    }

    return {
        positions,
        colours,
        clear,
        triangle,
        quadrilateral,
        cube,
        crosshair
    };
}

const model = geometry();

model.quadrilateral(
    [-1, 1, 1],
    [-1, -1, 1],
    [-1, -1, 0.5],
    [-1, 1, 0.5],
    [255, 0, 0, 255]
);

model.quadrilateral(
     [-1, -0.5, 0.5],
     [-1, -1, 0.5],
     [-1, -1, -1],
     [-1, -0.5, -1],
     [255, 0, 0, 255]
);

model.quadrilateral(
    [-1, 1, 1],
    [1, 1, 1],
    [1, 1, 0.5],
    [-1, 1, 0.5],
    [0, 255, 0, 255]
);

model.quadrilateral(
    [1, 1, 0.5],
    [1, 1, -1],
    [0.5, 1, -1],
    [0.5, 1, 0.5],
    [0, 255, 0, 255]
);

model.quadrilateral(
    [1, 1, -1],
    [1, -1, -1],
    [0.5, -1, -1],
    [0.5, 1, -1],
    [0, 0, 255, 255]
);

model.quadrilateral(
    [0.5, -0.5, -1],
    [0.5, -1, -1],
    [-1, -1, -1],
    [-1, -0.5, -1],
    [0, 0, 255, 255]
);

model.quadrilateral(
    [-1, 1, 0.5],
    [0.5, 1, 0.5],
    [0.5, 0.5, 0.5],
    [-1, 0.5, 0.5],
    [0, 255, 255, 255]
);

model.quadrilateral(
    [-1, 0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [-0.5, -0.5, 0.5],
    [-1, -0.5, 0.5],
    [0, 255, 255, 255]
);

model.quadrilateral(
    [-1, -0.5, 0.5],
    [-1, -0.5, -1],
    [-0.5, -0.5, -1],
    [-0.5, -0.5, 0.5],
    [255, 0, 255, 255]
);

model.quadrilateral(
    [-0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5],
    [0.5, -0.5, -1],
    [-0.5, -0.5, -1],
    [255, 0, 255, 255]
);

model.quadrilateral(
    [0.5, 1, 0.5],
    [0.5, 1, -1],
    [0.5, 0.5, -1],
    [0.5, 0.5, 0.5],
    [255, 255, 0, 255]
);

model.quadrilateral(
    [0.5, 0.5, -0.5],
    [0.5, 0.5, -1],
    [0.5, -0.5, -1],
    [0.5, -0.5, -0.5],
    [255, 255, 0, 255]
);

model.cube([0, 0, 0], 0.5, [200, 230, 250, 255]);

const highlights = geometry();

const positionsBuffer = program.buffer("a_position");
const colourBuffer = program.buffer("a_colour");

function updateBuffers() {
    positionsBuffer.data(new Float32Array(model.positions.concat(highlights.positions)));
    colourBuffer.data(new Uint8Array(model.colours.concat(highlights.colours)));
}

updateBuffers();

var matrixLocation = gl.getUniformLocation(program.program, "u_matrix");

const frameCounterLocation = gl.getUniformLocation(program.program, "u_frame");
let frameCounter = 0;

function viewport(name: string, gl: WebGLRenderingContext) {

    let _matrix = Matrix2.identity(4, 4);
    let _x = 0, _y = 0, _w = 0, _h = 0;

    function render(x: number, y: number, w: number, h: number, ...matrices: Matrix2[]) {
        _matrix = compose(...matrices);
        _x = x;
        _y = y;
        _w = w;
        _h = h;
        gl.viewport(_x, _y, _w, _h);
        gl.uniformMatrix4fv(matrixLocation, false, _matrix.to1DArray());
        gl.drawArrays(gl.TRIANGLES, 0, (model.positions.length + highlights.positions.length) / 3);
    }

    function hit(x: number, y: number) {
        x = (((x - _x) / _w) * 2) - 1;
        y = (((y - _y) / _h) * 2) - 1;
        
        if (x > -1 && x <= 1 && y > -1 && y <= 1) {

            const p = new Matrix([[x, y, 0, 1]]).mmul(inverse(_matrix)).to1DArray();
            highlights.clear();
            highlights.crosshair(p as Vertex, 0.05, [255, 255, 255, 70]);
            updateBuffers();
        }
    }

    return { render, hit };
}

const topLeft = viewport("topLeft", gl);
const topRight = viewport("topRight", gl);
const bottomLeft = viewport("bottomLeft", gl);
const bottomRight = viewport("bottomRight", gl);

let mouse = [0, 0];
let angle = [0, 0];

canvas.addEventListener("mousemove", e => {    
    if (e.buttons & 1) {
        angle[0] += (e.clientY - mouse[1]) / 100;
        angle[1] += (e.clientX - mouse[0]) / 100;        
    }

    mouse = [e.clientX, e.clientY];

    const dpr = window.devicePixelRatio || 1;
    const x = mouse[0] * dpr, y = gl.canvas.height - (mouse[1] * dpr);

    topLeft.hit(x, y);
    topRight.hit(x, y);    
    bottomLeft.hit(x, y);
    bottomRight.hit(x, y);
});

function compose(...[first, ...rest]: Matrix2[]): Matrix2 {
    return rest.length === 0 ? first : first.mmul(compose(...rest));
}

function resizeCanvasContinuously() {
    resizeCanvasToDisplaySize(canvas);

    gl.clearColor(0.2, 0.3, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program.program);

    gl.uniform1i(frameCounterLocation, frameCounter++);

    const aspectRatio = gl.canvas.width / gl.canvas.height;

    positionsBuffer.render(3, false);
    colourBuffer.render(4, true);

    const cw = gl.canvas.width / 2;
    const ch = gl.canvas.height / 2;

    const initial = Matrix.identity(4, 4);
    const final = scale(0.5/aspectRatio, 0.5, 0.5);

    topLeft.render(0, ch, cw, ch,
        initial,
        rotateX(-Math.PI/2),
        final
    );
    
    topRight.render(cw, ch, cw, ch,
        initial,
        final
    );
    
    bottomLeft.render(0, 0, cw, ch, 
        initial,
        rotateY(-Math.PI/2), 
        final);

    bottomRight.render(cw, 0, cw, ch,
        initial,
        rotateY(angle[1]), 
        rotateX(angle[0]),
        translate(0, 0, 1),
        projection(0.5),        
        final
    );

    requestAnimationFrame(resizeCanvasContinuously);
}

resizeCanvasContinuously();
