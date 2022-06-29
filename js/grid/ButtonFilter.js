class ButtonFilter {
    static _filter = [];
    static get filter() {
        return this._filter;
    }
    static get isFiltering() {
        return this._filter.length > 0;
    }
    static updateFilter() {
        const f = $("#buttons-filter-input").val().toString().split(" ");
        this._filter = f.filter((text) => text.length > 0);
        this._filter.forEach((text, i) => {
            this._filter[i] = text.toLowerCase();
        });
    }
}
$("#buttons-filter-input").on("input", (e) => {
    ButtonFilter.updateFilter();
    globallyUpdateFilter();
});
$("#clear-filter").on("click", () => {
    $("#buttons-filter-input").val("").trigger("input");
});
$("#buttons-filter-text, #buttons-filter-index, #buttons-filter-index-offset, #buttons-filter-tags, #buttons-filter-path").on("change", (e) => {
    if (!ButtonFilter.isFiltering)
        return;
    $("#buttons-filter-input").trigger("input");
});
function globallyUpdateFilter() {
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
    Logger.log(null, globallyUpdateFilter, "Filtered " + filteredButtons + " buttons.", "\nFilter:", ButtonFilter.filter, `\nConditions (${conditions.length}):`, conditions.length > 0 ? conditions.join(", ") : "none");
    Grid.$grid.toggleClass("filtering", filteredButtons > 0);
}
function filterButton($button) {
    const shouldHideButton = shouldHide($button);
    if (shouldHideButton)
        $button.removeClass("filtered").addClass("filtered");
    else {
        $button.addClass("filtered");
        $button[0].offsetHeight;
        $button.removeClass("filtered");
    }
}
function shouldHide($button) {
    return !ButtonFilter.filter.some((f) => {
        return isMatch($button, f);
    });
}
function isMatch($button, f) {
    return showConditions.some((match) => match($button, f));
}
function clearFilter() {
    $("#buttons-grid .soundbutton.filtered").each(showButton);
    Grid.$grid.removeClass("filtering");
}
function showButton(index, button) {
    $(button).removeClass("filtered");
}
const showConditions = [
    ($button, f) => {
        const text = $button.children(".button-theme").text();
        return ($("#buttons-filter-text").is(":checked") &&
            text != null &&
            text.toLowerCase().includes(f));
    },
    ($button, f) => {
        const index = parseInt($button.css("--index"));
        const offset = parseInt($("#buttons-filter-index-offset option:selected").val().toString());
        return ($("#buttons-filter-index").is(":checked") && index + offset === parseInt(f));
    },
    ($button, f) => {
        const tags = $button
            .attr("data-tags")
            ?.split(" ")
            .filter((tag) => tag.length > 0);
        return ($("#buttons-filter-tags").is(":checked") &&
            tags != null &&
            tags.some((tag) => tag.toLowerCase().includes(f)));
    },
    ($button, f) => {
        const path = $button.attr("data-path");
        return ($("#buttons-filter-path").is(":checked") &&
            path != null &&
            decodeURI(path).toLowerCase().includes(f));
    },
];
