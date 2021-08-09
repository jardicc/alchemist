import { IDescriptor } from "../../inspector/model/types";
import { parse, parseActionDescriptor, parseDescriptor } from "../ATNDecoder";
import { DataViewCustom } from "../DataViewCustom";
import { s2b } from "./helpers";

it("can decode simple ActionDescriptor with string", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooTEXT%00%00%00%04%00b%00a%00r%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: "bar",
	});
});

it("can decode lowest int", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03foolong%C2%80%00%00%00");

	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data, out);
	expect(out).toEqual({
		_obj: "null",
		foo: -2147483648,
	});
});

it("can decode int 1000", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03foolong%00%00%03%C3%A8");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj:"null",
		foo: 1000,
	});
});

it("can decode boolean true", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03foobool%01");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: true,
	});
});

it("can decode class", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03footype%00%00%00%01%00%00%00%00%00%03bar");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: {
			_class: "bar",
		},
	});
});

it("can decode double", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03foodoub%C3%80E5%C3%82%C2%8F%5C(%C3%B6");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo:  -42.42,
	});
});

it("can decode unit double", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooUntF#Prc%C3%80E5%C3%82%C2%8F%5C(%C3%B6");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: {
			_unit: "percentUnit",
			_value: -42.42,
		},
	});
});

it("can decode enum", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%00Fl%20%20enum%00%00%00%00Fl%20%20%00%00%00%00Wht%20");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		fill: {
			_enum: "fill",
			_value: "white",
		},
	});
});

it("can decode descriptor in descriptor", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooObjc%00%00%00%01%00%00%00%00%00%03bar%00%00%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: {
			_obj: "bar",
		},
	});
});

it("can decode list of integers and boolean", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooVlLs%00%00%00%03long%00%00%00%0Along%00%00%00%14bool%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [
			10,
			20,
			false,
		],
	});
});

it("can decode path", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%07examplePth%20%00%00%00(txtu(%00%00%00%0E%00%00%00C%00:%00%5C%00f%00o%00o%00%5C%00b%00a%00r%00.%00h%00i%00%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		example: {
			_kind: "local",
			_path: "C:\\foo\\bar.hi",
		},
	});
});

it("can decode raw data", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03footdta%00%00%00%06%00%00%00%10%C3%BF%C3%BF");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data, out);
	expect(out).toEqual({
		_obj: "null",
		foo: {
			_data: "AAAAEP//",
			_rawData: "base64",
		},
	});
});

it("can decode reference with index", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%03bar%00%00%00*");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [{
			_index: 42,
			_ref: "bar",
		}],
	});
});

it("can decode reference with identifier", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%01Idnt%00%00%00%01%00%00%00%00%00%00Dcmn%00%00%00%16");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [{
			_id: 22,
			_ref: "document",
		}],
	});
});

it("can decode reference with offset", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%01rele%00%00%00%01%00%00%00%00%00%00Dcmn%00%00%00%0C");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [{
			_offset: 12,
			_ref: "document",
		}],
	});
});

it("can decode reference with name", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%01name%00%00%00%01%00%00%00%00%00%00Dcmn%00%00%00%04%00b%00a%01Y%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [{
			_name: "bař",
			_ref: "document",
		}],
	});
});

it("can decode reference with class", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%01Clss%00%00%00%01%00%00%00%00%00%00Dcmn");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [{
			_ref: "document",
		}],
	});
});

it("can decode reference with enum", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%01Enmr%00%00%00%01%00%00%00%00%00%00Lyr%20%00%00%00%00Ordn%00%00%00%00Trgt");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [{
			_enum: "ordinal",
			_ref: "layer",
			_value: "targetEnum",
		}],
	});
});

it("can decode multiple reference indexes", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%03indx%00%00%00%01%00%00%00%00%00%03bar%00%00%00*indx%00%00%00%01%00%00%00%00%00%03bar%00%00%00+indx%00%00%00%01%00%00%00%00%00%03bar%00%00%00,");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [
			{
				_index: 42,
				_ref: "bar",
			},
			{
				_index: 43,
				_ref: "bar",
			},
			{
				_index: 44,
				_ref: "bar",
			},
		],
	});
});

it("can decode property with reference index", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03fooobj%20%00%00%00%02prop%00%00%00%01%00%00%00%00%00%00Prpr%00%00%00%00Hghtindx%00%00%00%01%00%00%00%00%00%00Dcmn%00%00%00%16");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: [
			{
				_property: "height",
				_ref: "property",
			},
			{
				_index: 22,
				_ref: "document",
			},
		],
	});
});


it("can decode lowest 52bit integer", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%03foocomp%C3%BF%C3%B0%00%00%00%00%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		foo: -4503599627370496, 
	});
});



it("can decode path longer than 128 chars", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%00Lnk%20Pth%20%00%00%01%C2%B8txtu%C2%B8%01%00%00%C3%96%00%00%00C%00:%00%5C%00U%00s%00e%00r%00s%00%5C%00J%00a%00r%00d%00a%00%5C%00D%00e%00s%00k%00t%00o%00p%00%5C%00s%00m%00a%00z%00a%00t%00%5C%00o%00p%00r%00a%00v%00d%00u%00M%00o%00c%00d%00l%00o%00u%00h%00%C3%A1%00C%00e%00s%00t%00a%00K%00s%00o%00u%00b%00o%00r%00u%00%5C%00o%00p%00r%00a%00v%00d%00u%00M%00o%00c%00d%00l%00o%00u%00h%00%C3%A1%00C%00e%00s%00t%00a%00K%00s%00o%00u%00b%00o%00r%00u%00%5C%00o%00p%00r%00a%00v%00d%00u%00M%00o%00c%00d%00l%00o%00u%00h%00%C3%A1%00C%00e%00s%00t%00a%00K%00s%00o%00u%00b%00o%00r%00u%00%5C%00o%00p%00r%00a%00v%00d%00u%00M%00o%00c%00d%00l%00o%00u%00h%00%C3%A1%00C%00e%00s%00t%00a%00K%00s%00o%00u%00b%00o%00r%00u%00%5C%00o%00p%00r%00a%00v%00d%00u%00M%00o%00c%00d%00l%00o%00u%00h%00%C3%A1%00C%00e%00s%00t%00a%00K%00s%00o%00u%00b%00o%00r%00u%00%5C%00o%00p%00r%00a%00v%00d%00u%00M%00o%00c%00d%00l%00o%00u%00h%00%C3%A1%00C%00e%00s%00t%00a%00K%00s%00o%00u%00b%00o%00r%00u%00.%00p%00s%00b%00%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		link: {
			_kind: "local",
			_path: "C:\\Users\\Jarda\\Desktop\\smazat\\opravduMocdlouháCestaKsouboru\\opravduMocdlouháCestaKsouboru\\opravduMocdlouháCestaKsouboru\\opravduMocdlouháCestaKsouboru\\opravduMocdlouháCestaKsouboru\\opravduMocdlouháCestaKsouboru.psb",
		},
	});
});
it("can decode path with \"ü\"", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00Opn%20%00%00%00%01%00%00%00%00nullPth%20%00%00%00ptxtup%00%00%002%00%00%00c%00:%00%5C%00U%00s%00e%00r%00s%00%5C%00J%00a%00r%00d%00a%00%5C%00D%00e%00s%00k%00t%00o%00p%00%5C%00s%00m%00a%00z%00a%00t%00%5C%00K%00i%00r%00s%00t%00e%00n%00%20%00K%00r%00u%03%08%00g%00e%00r%00.%00p%00s%00d%00%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "open",
		null: {
			_kind: "local",
			_path: "c:\\Users\\Jarda\\Desktop\\smazat\\Kirsten Krüger.psd",
		},
	});
});
it("can decode path with extra null terminator", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%00FilRPth%20%00%00%01%12txtu%12%01%00%00%C2%83%00%00%00d%00:%00%5C%00C%00l%00i%00e%00n%00t%00D%00i%00r%00%5C%002%000%002%001%00-%000%001%00-%001%008%00%5C%00D%00E%00S%00K%00T%00O%00P%00-%009%00I%00F%00S%00G%009%000%00-%00J%00a%00r%00d%00a%00%5C%00F%00i%00l%00e%00s%00%5C%001%002%003%004%00%5C%006%002%002%009%007%003%002%00_%00v%000%000%001%00_%00S%00u%00p%00p%00l%00i%00e%00d%00_%00O%00T%00L%00.%00p%00n%00g%00%5C%00W%00o%00r%00k%00i%00n%00g%00F%00i%00l%00e%00s%00%5C%006%002%002%009%007%003%002%00_%00v%000%000%001%00_%00S%00u%00p%00p%00l%00i%00e%00d%00_%00O%00T%00L%00.%00t%00i%00f%00%00%00%00%00");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		fileReference: {
			_kind: "local",
			_path: "d:\\ClientDir\\2021-01-18\\DESKTOP-9IFSG90-Jarda\\Files\\1234\\6229732_v001_Supplied_OTL.png\\WorkingFiles\\6229732_v001_Supplied_OTL.tif",
		},
	});
});


it("can decode object array as object array", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%03%00%00%00%00nullobj%20%00%00%00%01prop%00%00%00%01%00%00%00%00%00%00Chnl%00%00%00%00fsel%00%00%00%00T%20%20%20Objc%00%00%00%01%00%00%00%00%00%00Plgn%00%00%00%01%00%00%00%00Pts%20ObAr%00%00%00%04%00%00%00%01%00%00%00%00%00%00Pnt%20%00%00%00%02%00%00%00%00HrznUnFl#Pxl%00%00%00%04@%C2%84%C2%9B%C3%B6%C2%9B%02Y?@%C2%8A%C3%BA%C2%B71R3%C2%AB@%C2%91%C3%BCz%20%C3%A1w%C3%88@%C2%84%C2%9B%C3%B6%C2%9B%02Y?%00%00%00%00VrtcUnFl#Pxl%00%00%00%04@%C2%89%C2%B0%00%00%00%00%00@u%60%00%00%00%00%00@%C2%88%C2%90%00%00%00%00%00@%C2%8A%10%00%00%00%00%00%00%00%00%00AntAbool%01");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		"antiAlias": true,
		"null": [{
			"_property": "selection",
			"_ref": "channel",
		}],
		"to": {
			"_obj": "polygon",
			"points": {
				"_objList": "point",
				"horizontal": {
					"_unit": "pixelsUnit",
					"list": [
						659.4954128440367,
						863.3394495412844,
						1151.119266055046,
						659.4954128440367,
					],
				},
				"vertical": {
					"_unit": "pixelsUnit",
					"list": [
						822, 342, 786, 834,
					],
				},
			},
		},
	});
});


it("can decode list of references", () => {
	const buf = s2b("%00%00%00%10%00%00%00%01%00%00%00%00%00%00null%00%00%00%01%00%00%00%00nullVlLs%00%00%00%10obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%01obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%02obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%03obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%04obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%05obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%06obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%07obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%08obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%09obj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%0Aobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%0Bobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%0Cobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%0Dobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%0Eobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%0Fobj%20%00%00%00%01indx%00%00%00%01%00%00%00%00%00%00Path%00%00%00%10");
	const data = new DataViewCustom(buf, false);
	const out = {};

	parseDescriptor(data,out);
	expect(out).toEqual({
		_obj: "null",
		null: [{
			_ref: "path",
			_index: 1,
		},
		{
			_ref: "path",
			_index: 2,
		},
		{
			_ref: "path",
			_index: 3,
		},
		{
			_ref: "path",
			_index: 4,
		},
		{
			_ref: "path",
			_index: 5,
		},
		{
			_ref: "path",
			_index: 6,
		},
		{
			_ref: "path",
			_index: 7,
		},
		{
			_ref: "path",
			_index: 8,
		},
		{
			_ref: "path",
			_index: 9,
		},
		{
			_ref: "path",
			_index: 10,
		},
		{
			_ref: "path",
			_index: 11,
		},
		{
			_ref: "path",
			_index: 12,
		},
		{
			_ref: "path",
			_index: 13,
		},
		{
			_ref: "path",
			_index: 14,
		},
		{
			_ref: "path",
			_index: 15,
		},
		{
			_ref: "path",
			_index: 16,
		},
		],
	});
});