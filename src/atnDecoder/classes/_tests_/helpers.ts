
export function s2b(str: string): ArrayBuffer {
	
	const buf = Buffer.from(decodeURI(str), "binary");


	const ab = new ArrayBuffer(buf.length);
	const view = new Uint8Array(ab);
	for (let i = 0, len = buf.length; i < len; ++i) {
		view[i] = buf[i];
	}

	return view.buffer;
}