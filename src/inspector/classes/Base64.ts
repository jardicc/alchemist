
class InvalidCharacterError extends Error{
	constructor(message:string) {
		super();
		this.message = message;
	}

	public name =  "InvalidCharacterError";
}

export class Base64 {
	public static chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    
	// encoder
	// [https://gist.github.com/999166] by [https://github.com/nignag]
	public static btoa(input:string):string {
		const str = String(input);
		let output = "";
		for (
			// initialize result and counter
			let block=0, charCode, idx = 0, map = Base64.chars;
			// if the next str index does not exist:
			//   change the mapping table to "="
			//   check if d has no fractional digits
			str.charAt(idx | 0) || (map = "=", idx % 1);
			// "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
			output += map.charAt(63 & block >> 8 - idx % 1 * 8)
		) {
			charCode = str.charCodeAt(idx += 3 / 4);
			if (charCode > 0xFF) {
				throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
			}
			block = block << 8 | charCode;
		}
		return output;
	}
    
	// decoder
	// [https://gist.github.com/1020396] by [https://github.com/atk]
	public static atob(input:string):string {
		const str = (String(input)).replace(/[=]+$/, ""); // #31: ExtendScript bad parse of /=
		let output  = "";
		if (str.length % 4 === 1) {
			throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
		}
		for (
			// initialize result and counters
			let bc = 0, bs = 0, buffer, idx = 0;
			// get next character
			buffer = str.charAt(idx++); // eslint-disable-line no-cond-assign
			// character found in table? initialize bit storage and add its ascii value;
			~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
			// and if not first of each 4 characters,
			// convert the first 8 bits to one ascii character
			bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
		) {
			// try to find character in table (0-63, not found => -1)
			buffer = Base64.chars.indexOf(buffer);
		}
		return output;
	}
}

