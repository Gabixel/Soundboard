// See https://www.electronforge.io/configuration
module.exports = {
	packagerConfig: {},
	rebuildConfig: {},
	// See https://www.electronforge.io/config/makers
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {},
		},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin"],
		},
		{
			name: "@electron-forge/maker-deb",
			config: {},
		},
		{
			name: "@electron-forge/maker-rpm",
			config: {},
		},
	],
	publishers: [],
	plugins: [],
	hooks: {},
	buildIdentifier: "prod",
};
