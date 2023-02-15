type ContextMenuArgs =
	| null
	| (
			| { type: "soundbutton"; buttonData: any }
			| { type: "test1"; coolThing: number }
			| { type: "test999"; a: 1; b: 2 }
	  );
