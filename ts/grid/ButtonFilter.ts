// class ButtonFilter {

// }

// TODO: filter when a function for updating a button is implemented.

// Trigger the filter input when the text changes
$("#buttons-filter").on("input", (e) => {
	applyFilter($("#buttons-filter").val().toString());
});

$(
	"#buttons-filter-text, #buttons-filter-index, #buttons-filter-tags, #buttons-filter-path"
).on("change", (e) => {
	if ($("#buttons-filter").val().toString().length === 0) return;

	$("#buttons-filter").trigger("input");
});

function refreshFilter(): void {
	Logger.log(null, applyFilter, "Refreshing filter...");
	$("#buttons-filter").trigger("input");
}

function applyFilter(filterText: string): void {
	if (filterText === "") {
		Logger.log(null, applyFilter, "Cleared filter.");
		clearFilter();
		return;
	}

	$("#buttons-grid .soundbutton").each((index, button) => {
		const $button = $(button);
		const isMatch = !buttonFilterCheck($button, filterText);

		$button.toggleClass("filtered", isMatch);
	});

	const filteredButtons = $("#buttons-grid .soundbutton.filtered").length;

	Logger.log(
		null,
		applyFilter,
		"Filtered " + filteredButtons + ' buttons with filter "' + filterText + '"'
	);

	if (filteredButtons > 0) $("#buttons-grid").addClass("filtering");
	else $("#buttons-grid").removeClass("filtering");
}

const buttonFilterCheck = function (
	$button: JQuery<HTMLElement>,
	filterText: string
): boolean {
	if (
		$("#buttons-filter-text").is(":checked") &&
		$button.text().includes(filterText)
	)
		return true;

	if (
		$("#buttons-filter-index").is(":checked") &&
		$button.attr("id")?.substring(10).includes(filterText)
	)
		return true;

	if (
		$("#buttons-filter-tags").is(":checked") &&
		$button.attr("data-tags")?.includes(filterText)
	)
		return true;

	if (
		$("#buttons-filter-path").is(":checked") &&
		decodeURI($button.attr("data-path")).includes(filterText)
	)
		return true;

	return false;
};

// Remove the "filtered" class from all buttons
function clearFilter() {
	$("#buttons-grid .soundbutton.filtered").each(showButton);
	$("#buttons-grid").removeClass("filtering");
}

function showButton(index: number, button: HTMLElement) {
	$(button).removeClass("filtered");
}
