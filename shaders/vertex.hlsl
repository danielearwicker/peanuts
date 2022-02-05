attribute vec4 a_position;
attribute vec4 a_colour;

uniform int u_frame;
uniform mat4 u_matrix;

varying vec4 v_color;

void main() {

    gl_Position = u_matrix * vec4(a_position.x, a_position.y, a_position.z, 1);

    float d = (gl_Position.z + 1.0)*1.5;

    v_color = vec4(a_colour.x / d, a_colour.y / d, a_colour.z / d, a_colour.w);                    
}
