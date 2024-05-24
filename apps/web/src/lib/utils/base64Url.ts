export const base64Url = {
  encode(array: Uint8Array | ArrayBuffer) {
    const unit8Array =
      array instanceof ArrayBuffer ? new Uint8Array(array) : array;
    const buf: number[] = Array.from(unit8Array);
    const base64 = btoa(String.fromCharCode(...buf));
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  },

  decode(str: string): ArrayBuffer {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) {
      str += "=";
    }
    const unit8Array = new Uint8Array(
      atob(str)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );
    const arrayBuffer = unit8Array.buffer.slice(
      unit8Array.byteOffset,
      unit8Array.byteOffset + unit8Array.byteLength,
    );
    return arrayBuffer;
  },
};
