$("#stop-audio").on("click", async () => {
	AudioPlayer.stop();
	updatePlayPauseButton();
});

$("#play-pause-audio").on("click", async () => {
	if (AudioPlayer.isPlaying) {
		AudioPlayer.pause();
	} else {
		await AudioPlayer.play();
	}

	updatePlayPauseButton();
});

function updatePlayPauseButton(
	doTimeout: boolean = true,
	i: number = 0,
	wasPlaying: boolean = false
): void {
	if (i == 0) updatePlayPauseButton(doTimeout, i + 1, wasPlaying);

	if (doTimeout)
		setTimeout(() => {
			const isAudioChanged = wasPlaying != AudioPlayer.isPlaying;
			updatePlayPauseButton(isAudioChanged, i + 1, wasPlaying);
		}, 10);

	const isPlaying = AudioPlayer.isPlaying;

	let $content = $("#play-pause-audio i.fa-pause, #play-pause-audio i.fa-play");

	if (isPlaying) {
		$content.addClass("fa-pause").removeClass("fa-play");
	} else {
		$content.addClass("fa-play").removeClass("fa-pause");
	}
}
