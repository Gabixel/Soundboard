$("#volume")
	.on("input", () => {
		AudioPlayer.volume = $("#volume").val() as number / 1000;
	})
	.on("wheel", (e) => EventFunctions.updateInputFromWheel(e, 50, true, ["input"]));