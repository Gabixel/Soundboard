abstract class UserInterface {
	public static elementFromPoint(x: number, y: number): Element {
		return document.elementFromPoint(x, y);
	}

	public static swapElements($element1: JQuery<HTMLElement>, $element2: JQuery<HTMLElement>) {
		const $temp = $("<div>", {
			style: "display: none;"
		});

		$temp.insertBefore($element2);
		
		$element2.insertBefore($element1);

		$element1.insertBefore($temp);

		$temp.remove();
	}
}
