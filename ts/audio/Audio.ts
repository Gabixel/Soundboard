// let playPauseTimeout: NodeJS.Timeout;

$("#stop-audio").on("click", async () => {
	Logger.logInfo(null, null, "Stop audio button clicked");
	AudioPlayer.stop();
});

$("#play-pause-audio").on("click", async () => {
	if (AudioPlayer.isPlaying) {
		AudioPlayer.pause();
	} else {
		await AudioPlayer.play();
	}
});

/*function updatePlayPauseButton(
	doTimeout: boolean = true,
	i: number = 0,
	wasPlaying: boolean = false
): void {
	// if (doTimeout) {
	// 	clearTimeout(playPauseTimeout);
	// 	playPauseTimeout = setTimeout(() => {
	// 		const isAudioChanged = wasPlaying != AudioPlayer.isPlaying;
	// 		updatePlayPauseButton(isAudioChanged, i + 1, wasPlaying);
	// 	}, 15);
	// }

	Logger.log(
		null,
		updatePlayPauseButton,
		"Updating play/pause button, current state:",
		AudioPlayer.isPlaying
	);

	const isPlaying = AudioPlayer.isPlaying;

	let $content = $("#play-pause-audio i.fa-pause, #play-pause-audio i.fa-play");

	if (isPlaying) {
		$content.addClass("fa-pause").removeClass("fa-play");
	} else {
		$content.addClass("fa-play").removeClass("fa-pause");
	}

	Logger.log(
		null,
		updatePlayPauseButton,
		"New play/pause button state:",
		isPlaying
	);
}
*/

// TODO: make play/pause button work correctly.