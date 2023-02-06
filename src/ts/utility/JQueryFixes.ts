abstract class JQueryFixes {
	public static fixPassiveEvents(): void {
		$.event.special.touchstart = {
			setup: function (this, _data, namespace, handle) {
				this.addEventListener(
					"touchstart",
					handle as object as EventListenerOrEventListenerObject,
					{
						passive: !namespace.includes("noPreventDefault"),
					}
				);
			},
		};
		$.event.special.touchmove = {
			setup: function (this, _data, namespace, handle) {
				this.addEventListener(
					"touchmove",
					handle as object as EventListenerOrEventListenerObject,
					{
						passive: !namespace.includes("noPreventDefault"),
					}
				);
			},
		};
		$.event.special.wheel = {
			setup: function (this, _data, _namespace, handle) {
				this.addEventListener(
					"wheel",
					handle as object as EventListenerOrEventListenerObject,
					{ passive: true }
				);
			},
		};
		$.event.special.mousewheel = {
			setup: function (this, _data, _namespace, handle) {
				this.addEventListener(
					"mousewheel",
					handle as object as EventListenerOrEventListenerObject,
					{ passive: true }
				);
			},
		};
	}
}