/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const common = require("./webpack.config.common.js");

module.exports = {
	mode: "development",
	devtool: "source-map",
	...common,
};