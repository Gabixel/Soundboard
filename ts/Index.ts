//#region Types
type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};
type AudioGroup = {
	main: AudioJS;
	playback: AudioJS;
	lastTrack?: string;
	forcedEnding?: boolean;
};
type SoundButtonData = {
	title: string;
	color: {
		h: number;
		s: number;
		l: number;
	};
	image: string;
	tags: string[];
	path: string;
	index: number;
};
//#endregion

$("#grid-rows, #grid-columns").trigger("change"); // Initializes grid
AudioPlayer.updateAudioDevicesList();
$("#volume").trigger("input"); // Initializes volume in the audio player

$(document).on("wheel", (e) => {
	if (!e.ctrlKey) return;

	// e.preventDefault();

	const value = EventFunctions.getUpdatedValueFromWheel(
		e,
		parseFloat($(document.body).css("zoom").toString()),
		0.08,
		[0.8, 1.5]
	).toString();

	$(document.body).stop(true, false);
	$("#ui-scale").val(value);
	$(document.body).css("zoom", value);
});

$("#reset-ui-scale").on("click", () => {
	$("#ui-scale").val($("#ui-scale").attr("--data-default")).trigger("click");
});

$("#ui-scale")
	.on("keydown", (e) => {
		$(e.target).attr("step", "0.05");
	})
	.on("keyup", (e) => {
		$(e.target).attr("step", "0.01").trigger("click");
	})
	.on("focusout", (e) => {
		$(e.target).attr("step", "0.01"); // In case the user clicks away from the input while still holding the left or right arrow keys
	})
	.on("click", (e) => {
		$(document.body).stop(true, false);
		$(document.body).animate(
			{
				zoom: parseFloat($(e.target).val().toString()),
			},
			325
		);
	});

$(document).on("contextmenu", (e) => {
	console.log(e.target);

	let $target = $(e.target);

	let args = {
		x: e.clientX.toString(),
		y: e.clientY.toString(),
		isSoundButton: $target.hasClass("soundbutton"),
		buttonData: {} /*as SoundButtonData*/,
	};

	if (args.isSoundButton)
		args.buttonData = {
			title: $target.text(),
			color: {
				h: parseInt($target.css("--hue")),
				s: parseInt($target.css("--saturation")),
				l: parseInt($target.css("--lightness")),
			},
			// TODO: finish
		};

	// @ts-ignore: TS2339
	window.api.openContextMenu(args);
});
