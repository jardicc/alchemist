// Lightweight mock for react-uxp-spectrum.
// Each component simply renders its children (or nothing) so JSX in tests works.
const React = require("react");

const passthrough = (displayName) => {
	const Comp = ({children}) => React.createElement(React.Fragment, null, children ?? null);
	Comp.displayName = displayName;
	return Comp;
};

const Body = passthrough("Body");
const Detail = passthrough("Detail");
const Heading = passthrough("Heading");
const Label = passthrough("Label");
const ActionButton = passthrough("ActionButton");
const Button = passthrough("Button");
const Checkbox = passthrough("Checkbox");
const Divider = () => null;
const Dropdown = passthrough("Dropdown");
const Icon = () => null;
const Link = passthrough("Link");
const Menu = passthrough("Menu");
const MenuItem = passthrough("MenuItem");
const Progressbar = () => null;
const Radio = passthrough("Radio");
const RadioGroup = passthrough("RadioGroup");
const Slider = () => null;
const Textarea = passthrough("Textarea");
const Textfield = ({children, className, onInput, type, placeholder, ...rest}) =>
	React.createElement("input", {className, onInput, onChange: onInput, type, placeholder}, null);
const SpectrumComponetDefaults = {};

const Spectrum = {
	Body, Detail, Heading, Label, ActionButton, Button, Checkbox, Divider,
	Dropdown, Icon, Link, Menu, MenuItem, Progressbar, Radio, RadioGroup, Slider, Textarea,
	Textfield, SpectrumComponetDefaults,
};

module.exports = {
	default: Spectrum,
	Body, Detail, Heading, Label, ActionButton, Button, Checkbox, Divider,
	Dropdown, Icon, Link, Menu, MenuItem, Progressbar, Radio, RadioGroup, Slider, Textarea,
	Textfield, SpectrumComponetDefaults,
};
