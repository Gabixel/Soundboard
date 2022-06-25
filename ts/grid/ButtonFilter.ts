class ButtonFilter {
	private static _filter: string[] = [];

	public static get filter(): string[] {
		return this._filter;
	}

	public static get isFiltering(): boolean {
		return this._filter.length > 0;
	}

	public static updateFilter(): void {
		const f = $("#buttons-filter").val().toString();
		this._filter = f.split(" ").filter((f) => f.length > 0);
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
	if (!ButtonFilter.isFiltering) return;

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
			" buttons. Filter:",
			ButtonFilter.filter
	);

	$("#buttons-grid").toggleClass("filtering", filteredButtons > 0);
}

function filterButton($button: JQuery<HTMLElement>) {
	const shouldHideButton = shouldHide($button);

	if (shouldHideButton) $button.removeClass("filtered").addClass("filtered");
	else {
		$button.addClass("filtered");
		$button[0].offsetHeight;
		$button.removeClass("filtered");
	}
}

function shouldHide(
	$button: JQuery<HTMLElement>
): boolean {
	// // // We need to break when the first false is found, and `every()` does exactly that.
	// // ButtonFilter.filter.every((f) => {
	// // 	shouldHide = !isMatch($button, f.toLowerCase());
	// // 	return shouldHide; // We want to hide the button only when every condition is true.
	// // });

	for (const f in ButtonFilter.filter) {
		const show = isMatch($button, f.toLowerCase());

		if (show) return false;
	}

	return true;
}

function isMatch($button: JQuery<HTMLElement>, f: string): boolean {
	return conditions.some((match) => match($button, f)); // TODO: doesn't filter multiple matches
}

// Removes the "filtered" class from all buttons
function clearFilter() {
	$("#buttons-grid .soundbutton.filtered").each(showButton);
	$("#buttons-grid").removeClass("filtering");
}

function showButton(index: number, button: HTMLElement) {
	$(button).removeClass("filtered");
}

const conditions: (($button: JQuery<HTMLElement>, f: string) => boolean)[] = [
	// Text
	($button: JQuery<HTMLElement>, f: string): boolean => {
		return (
			$("#buttons-filter-text").is(":checked") &&
			$button.children(".button-theme").text()?.toLowerCase().includes(f)
		);
	},
	// CSS Index
	($button: JQuery<HTMLElement>, f: string): boolean => {
		return (
			$("#buttons-filter-index").is(":checked") && $button.css("--index") === f
		);
	},
	// Tags
	($button: JQuery<HTMLElement>, f: string): boolean => {
		const tags = $button.attr("data-tags")?.toLowerCase().split(" ");

		return (
			$("#buttons-filter-tags").is(":checked") &&
			tags.some((tag) => tag.includes(f))
		);
	},
	// Path
	($button: JQuery<HTMLElement>, f: string): boolean => {
		const path = decodeURI($button.attr("data-path"))?.toLowerCase();

		return $("#buttons-filter-path").is(":checked") && path.includes(f);
	},
];
