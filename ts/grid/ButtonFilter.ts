class ButtonFilter {
	private static _filter: string[] = [];

	public static get filter(): string[] {
		return this._filter;
	}

	public static get isFiltering(): boolean {
		return this._filter.length > 0;
	}

	public static updateFilter(): void {
		const f = $("#buttons-filter").val().toString().split(" ");
		this._filter = f.filter((text) => text.length > 0);
		this._filter.forEach((text, i) => {
			this._filter[i] = text.toLowerCase();
		});
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
	"#buttons-filter-text, #buttons-filter-index, #buttons-filter-index-offset, #buttons-filter-tags, #buttons-filter-path"
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

	const offset = $("#buttons-filter-index-offset option:selected").val();

	const conditions = [
		$("#buttons-filter-text").is(":checked") ? "text" : "",
		$("#buttons-filter-index").is(":checked") ? `index (offset: ${offset})` : "",
		$("#buttons-filter-tags").is(":checked") ? "tags" : "",
		$("#buttons-filter-path").is(":checked") ? "path" : "",
	].filter((f) => f.length > 0);

	Logger.log(
		null,
		globallyUpdateFilter,
		"Filtered " + filteredButtons + " buttons.",
		"\nFilter:",
		ButtonFilter.filter,
		`\nConditions (${conditions.length}):`,
		conditions.length > 0 ? conditions.join(", ") : "none"
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

function shouldHide($button: JQuery<HTMLElement>): boolean {
	return !ButtonFilter.filter.some((f) => {
		return isMatch($button, f);
	});
}

function isMatch($button: JQuery<HTMLElement>, f: string): boolean {
	return showConditions.some((match) => match($button, f));
}

// Removes the "filtered" class from all buttons
function clearFilter() {
	$("#buttons-grid .soundbutton.filtered").each(showButton);
	$("#buttons-grid").removeClass("filtering");
}

function showButton(index: number, button: HTMLElement) {
	$(button).removeClass("filtered");
}

const showConditions: (($button: JQuery<HTMLElement>, f: string) => boolean)[] =
	[
		// Text
		($button: JQuery<HTMLElement>, f: string): boolean => {
			const text = $button.children(".button-theme").text();

			return (
				$("#buttons-filter-text").is(":checked") &&
				text != null &&
				text.toLowerCase().includes(f)
			);
		},
		// CSS Index
		($button: JQuery<HTMLElement>, f: string): boolean => {
			const index = parseInt($button.css("--index"));
			const offset = parseInt(
				$("#buttons-filter-index-offset option:selected").val().toString()
			);

			return (
				$("#buttons-filter-index").is(":checked") && index + offset === parseInt(f)
			);
		},
		// Tags
		($button: JQuery<HTMLElement>, f: string): boolean => {
			const tags = $button
				.attr("data-tags")
				?.split(" ")
				.filter((tag) => tag.length > 0);

			return (
				$("#buttons-filter-tags").is(":checked") &&
				tags != null &&
				tags.some((tag) => tag.toLowerCase().includes(f))
			);
		},
		// Path
		($button: JQuery<HTMLElement>, f: string): boolean => {
			const path = $button.attr("data-path");

			return (
				$("#buttons-filter-path").is(":checked") &&
				path != null &&
				decodeURI(path).toLowerCase().includes(f)
			);
		},
	];
