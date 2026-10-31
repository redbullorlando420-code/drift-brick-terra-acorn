export function glb() {
  const text = JSON.stringify({
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteLength: 36 }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [0, 0, 0],
        max: [1, 1, 0],
      },
    ],
  });
  const json = Buffer.from(text + " ".repeat((4 - (text.length % 4)) % 4)),
    binary = Buffer.from(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]).buffer),
    buffer = Buffer.alloc(12 + 8 + json.length + 8 + binary.length);
  buffer.writeUInt32LE(0x46546c67, 0);
  buffer.writeUInt32LE(2, 4);
  buffer.writeUInt32LE(buffer.length, 8);
  buffer.writeUInt32LE(json.length, 12);
  buffer.writeUInt32LE(0x4e4f534a, 16);
  json.copy(buffer, 20);
  buffer.writeUInt32LE(binary.length, 20 + json.length);
  buffer.writeUInt32LE(0x004e4942, 24 + json.length);
  binary.copy(buffer, 28 + json.length);
  return buffer;
}
