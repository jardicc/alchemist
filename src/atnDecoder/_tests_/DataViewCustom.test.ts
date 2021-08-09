import { DataViewCustom } from "../DataViewCustom";

describe("unicode string", () => {
	it("can decode unicode empty string \"\"", () => {

		const data = new DataViewCustom([0, 0, 0, 1, 0, 0], false);
		const res = data.getUtf16String();

		expect(res).toBe("");
	});
	
	it("can decode unicode string r with accent", () => {
		debugger;
		const data = new DataViewCustom([0, 0, 0, 2, 1,89 , 0, 0], false);
		const res = data.getUtf16String();

		console.log(Buffer.from(res));

		expect(res).toBe("ř");
	});

	
	it("can decode complex unicode string with offset", () => {

		const data = new DataViewCustom([
			99, 99, 99, 99, 99, 0, 0, 0, 39, 0, 80, 1, 89, 0, 237, 0, 108, 0, 105, 1, 97, 0, 32, 1, 126, 0, 108, 0, 117,
			1, 101, 0, 111, 0, 117, 1, 13, 0, 107, 0, 253, 0, 32, 0, 107, 1, 111, 1, 72, 0, 32, 0, 250,
			0, 112, 1, 27, 0, 108, 0, 32, 1, 15, 0, 225, 0, 98, 0, 101, 0, 108, 0, 115, 0, 107, 0, 233, 0, 32, 0, 243, 0, 100, 0, 121, 0, 0,
		], false);
		data.offset = 5;
		const res = data.getUtf16String();

		expect(res).toBe("Příliš žluťoučký kůň úpěl ďábelské ódy");

	});

	it("can decode four bytes per character utf-16 letters \"𐐷a𤭢b𐐷𤭢\"", () => {
		const data = new DataViewCustom([
			0,0,0,11,216,1,220,55,0,97,216,82,223,98,0,98,216,1,220,55,216,82,223,98,0,0,
		], false);
		const res = data.getUtf16String();

		expect(res).toBe("𐐷a𤭢b𐐷𤭢");
	});



	it("can decode string with \"ü\"", () => {

		const data = new DataViewCustom([
			0,0,0,3,0,252,0,103,
		], false);
		const res = data.getUtf16String();

		expect(res).toBe("üg");
	});

});