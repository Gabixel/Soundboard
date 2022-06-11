$("#reset-ui-scale").on("click", () => {
	$("#ui-scale").val($("#ui-scale").attr("--data-default")).trigger("click");
});

$("#ui-scale")
	// .on("keydown", (e) => {
	// 	$(e.target).attr("step", "0.2");
	// })
	.on("keyup", (e) => {
		$(e.target).trigger("click"); //.attr("step", "0.1")
	})
	// .on("focusout", (e) => {
	// 	$(e.target).attr("step", "0.1"); // In case the user clicks away from the input while still holding the left or right arrow keys
	// })
	.on("click", (e) => {
		$(document.body).stop(true, false);
		$(document.body).animate(
			{
				zoom: parseFloat($(e.target).val().toString()),
			},
			325
		);
	});
