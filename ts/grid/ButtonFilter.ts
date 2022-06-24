class ButtonFilter {
	private static _filter: string = "";

	public static get filter(): string {
		return this._filter;
	}

	public static get isFiltering(): boolean {
		return this._filter != "";
	}

	public static updateFilter(): void {
		this._filter = $("#buttons-filter").val().toString();
	}
}

// TODO: filter when a function for updating a button is implemented.

// Trigger the filter input when the text changes
$("#buttons-filter").on("input", (e) => {
	ButtonFilter.updateFilter();
	globallyUpdateFilter();
});

$("#clear-filter").on("click", () => {
	$("#buttons-filter").val("").trigger("input");
});

$(
	"#buttons-filter-text, #buttons-filter-index, #buttons-filter-tags, #buttons-filter-path"
).on("change", (e) => {
	if (ButtonFilter.filter.length === 0) return;

	$("#buttons-filter").trigger("input");
});

function globallyUpdateFilter(): void {
	if (!ButtonFilter.isFiltering) {
		Logger.log(null, globallyUpdateFilter, "Cleared filter.");
		clearFilter();
		return;
	}

	$("#buttons-grid .soundbutton").each((index, button) => {
		filterButton($(button));
	});

	const filteredButtons = $("#buttons-grid .soundbutton.filtered").length;

	Logger.log(
		null,
		globallyUpdateFilter,
		"Filtered " +
			filteredButtons +
			' buttons with filter "' +
			ButtonFilter.filter +
			'"'
	);

	$("#buttons-grid").toggleClass("filtering", filteredButtons > 0);
}

function filterButton($button: JQuery<HTMLElement>) {
	const shouldHide = buttonHideCheck($button, ButtonFilter.filter);

	if (shouldHide) $button.removeClass("filtered").addClass("filtered");
	else {
		$button.addClass("filtered");
		$button[0].offsetHeight;
		$button.removeClass("filtered");
	}
}

function buttonHideCheck(
	$button: JQuery<HTMLElement>,
	filterText: string
): boolean {
	let filters = filterText.split(" ").filter((f) => f.length > 0);

	let shouldHide = true;

	filters.forEach((f) => {
		shouldHide = !isMatch($button, f.toLowerCase());
	});

	return shouldHide;
}

function isMatch($button: JQuery<HTMLElement>, f: string): boolean {
	return matches.some((match) => match($button, f));
}

// Remove the "filtered" class from all buttons
function clearFilter() {
	$("#buttons-grid .soundbutton.filtered").each(showButton);
	$("#buttons-grid").removeClass("filtering");
}

function showButton(index: number, button: HTMLElement) {
	$(button).removeClass("filtered");
}

const matches: (($button: JQuery<HTMLElement>, f: string) => boolean)[] = [
	// Text
	($button: JQuery<HTMLElement>, f: string): boolean =>
		$("#buttons-filter-text").is(":checked") &&
		$button.children(".button-theme").text()?.toLowerCase().includes(f),
	// CSS Index
	($button: JQuery<HTMLElement>, f: string): boolean =>
		$("#buttons-filter-index").is(":checked") &&
		$button.css("--index")?.includes(f),
	// Tags
	($button: JQuery<HTMLElement>, f: string): boolean =>
		$("#buttons-filter-tags").is(":checked") &&
		$button
			.attr("data-tags")
			?.toLowerCase()
			.split(" ")
			.some((tag) => tag.includes(f)),
	// Path
	($button: JQuery<HTMLElement>, f: string): boolean =>
		$("#buttons-filter-path").is(":checked") &&
		decodeURI($button.attr("data-path"))?.toLowerCase().includes(f),
];
