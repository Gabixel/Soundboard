// class ButtonsFilter {

// }

// Trigger "#buttons-filter" with jquery when the text changes
$("#buttons-filter").on("input", () => {
	applyFilter($("#buttons-filter").val().toString());
});

function refreshFilter(): void {
	$("#buttons-filter").trigger("input");
}

function applyFilter(filterText: string): void {
	if (filterText === "") {
		Logger.log(null, applyFilter, "Cleared filter.");
		clearFilter();
		return;
	}

	Logger.log(null, applyFilter, `Applying filter "${filterText}"...`);

	$("#buttons-grid .soundbutton").each((index, button) => {
		const $button = $(button);
		const isMatch = !buttonFilterCheck($button, filterText);

		$button.toggleClass("filtered", isMatch);
	});

	const filteredButtons = $("#buttons-grid .soundbutton.filtered").length;

	Logger.log(null, applyFilter, "Filtered " + filteredButtons + " buttons");

	if (filteredButtons > 0) $("#buttons-grid").addClass("filtering");
	else $("#buttons-grid").removeClass("filtering");
}

const buttonFilterCheck = function (
	$button: JQuery<HTMLElement>,
	filterText: string
): boolean {
	const title = $button.text(); // TODO: not sure if I should use .text() or use an .attr() for the text (probably just the rendered text).
	const id = $button.attr("id")?.substring(10);
	const tags = $button.attr("data-tags");
	const path = $button.attr("data-path");

	return (
		title?.includes(filterText) ||
		id?.includes(filterText) ||
		tags?.includes(filterText) ||
		path?.includes(filterText)
	);
};

// Remove the "filtered" class from all buttons
function clearFilter() {
	$("#buttons-grid .soundbutton.filtered").each(showButton);
	$("#buttons-grid").removeClass("filtering");
}

function showButton(index: number, button: HTMLElement) {
	$(button).removeClass("filtered");
}
