class GridSoundButtonFilter {
	private _conditions: Map<string, GridFilterCondition>;
	private _$filterInput: GridFilterInput;

	public get filterText(): string {
		return this._$filterInput.val();
	}

	constructor($filterInput: GridFilterInput, initialConditions?: GridFilterCondition[]) {
		this._conditions = new Map<string, GridFilterCondition>();
		this._$filterInput = $filterInput;

		if (initialConditions) {
			this.addConditions(initialConditions);
		}
	}

	public addConditions(conditions: GridFilterCondition[]): void {
		conditions.forEach((condition) => {
			this.addCondition(condition);
		});
	}

	private addCondition(condition: GridFilterCondition): void {
		this._conditions.set(condition.id, condition);
	}

	public triggerConditionChange(id: string, isActive: boolean): void {
		let condition = this._conditions.get(id);

		if (!condition) {
			throw new ReferenceError(`Condition not found with id "${id}"`);
		}

		condition.isActive = isActive;

		// TODO: update subconditions, if present

		// TODO: update something
	}
}

/*public mainFilter: string;
	
	public conditions: Array<{
		name: string;
		isActive: boolean;
		check: (input: string) => boolean;
	}>;
	
	constructor(mainFilter: string) {
		this.mainFilter = mainFilter;
		this.conditions = [
			{
				name: "Condition 1",
				isActive: false,
				check: (input: string) => input.length > 5,
			},
			{
				name: "Condition 2",
				isActive: false,
				check: (input: string) => input.indexOf("test") !== -1,
			},
			{
				name: "Condition 3",
				isActive: false,
				check: (input: string) => input.indexOf("example") !== -1,
			},
		];
	}
	
	public filter(items: Array<string>): Array<string> {
		return items.filter((item) => {
			let match = true;
			if (item.indexOf(this.mainFilter) === -1) {
				match = false;
			}
			this.conditions.forEach((condition) => {
				if (condition.isActive && !condition.check(item)) {
					match = false;
				}
			});
			return match;
		});
	}*/
