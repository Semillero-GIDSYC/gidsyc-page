import pointCloudUrl from './brainPointCloud.bin?url';

let pointCloudPromise: Promise<Float32Array> | null = null;

export async function loadBrainPointCloud(): Promise<Float32Array> {
  if (!pointCloudPromise) {
    pointCloudPromise = fetch(pointCloudUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load brain point cloud: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (buffer.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0) {
          throw new Error('Brain point cloud binary has an invalid byte length');
        }
        return new Float32Array(buffer);
      });
  }

  return pointCloudPromise;
}
