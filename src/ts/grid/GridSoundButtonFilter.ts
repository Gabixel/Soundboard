class GridSoundButtonFilter {
	private _conditions: Map<string, GridFilterCondition>;
	private _$filterInput: GridFilterInput;
	private _$conditionsContainer: JQuery<HTMLDivElement>;

	public get filterText(): string {
		return this._$filterInput.val();
	}

	//#region Components

	public $checkbox(id: string): JQuery<HTMLInputElement> {
		return $("<input>", {
			type: "checkbox",
			id,
		}).on("change", (e) => {
			let $target = $(e.target);
			const id = e.target.id;

			console.log("triggered change to checkbox");

			this.triggerConditionChange(id, $target.is("checked"));
		}) as JQuery<HTMLInputElement>;
	}

	public $label(forId: string, text: string): JQuery<HTMLLabelElement> {
		return $("<label>", {
			for: forId,
			text,
		}) as JQuery<HTMLLabelElement>;
	}

	//#endregion

	constructor(
		$filterInput: GridFilterInput,
		$conidtionsContainer: JQuery<HTMLDivElement>
	) {
		this._conditions = new Map<string, GridFilterCondition>();

		this._$filterInput = $filterInput;
		this._$conditionsContainer = $conidtionsContainer;
	}

	public addConditions(conditions: GridFilterCondition[]): void {
		conditions.forEach((condition) => {
			this.addCondition(condition);
		});
	}

	private addCondition(condition: GridFilterCondition): void {
		this._conditions.set(condition.id, condition);

		this.generateConditionElements(condition);
	}

	/**
	 * Returns which buttons must be filtered out.
	 * @param buttonsData The buttons to check.
	 * @returns The buttons that **didn't** pass the filter.
	 */
	public getFilteredOutButtons(
		buttonsData: SoundButtonData[]
	): SoundButtonData[] {
		return buttonsData.filter((buttonData) => {
			return this.shouldFilterOutButton(buttonData);
		});
	}

	public triggerConditionChange(id: string, isActive: boolean): void {
		let condition = this._conditions.get(id);

		if (!condition) {
			throw new ReferenceError(`Condition not found with id "${id}"`);
		}

		condition.isActive = isActive;

		// TODO: update something more?
	}

	public triggerSubConditionChange<TSubConditionValue>(
		id: string,
		subId: string,
		value: TSubConditionValue
	): void {
		let condition = this._conditions.get(id);

		if (!condition) {
			throw new ReferenceError(`Condition not found with id "${id}"`);
		}

		condition.data.get(subId).value = value;

		// TODO: update something more?
	}

	private shouldFilterOutButton(buttonData: SoundButtonData): boolean {
		for (const conditionId in this._conditions) {
			const condition = this._conditions.get(conditionId);

			if (!condition.isActive) {
				continue;
			}

			if (!condition.check(buttonData)) {
				return true;
			}
		}

		return false;
	}

	public generateConditionElements(condition: GridFilterCondition): void {
		this.appendCondition(condition);
	}

	private appendCondition<TConditionValue = boolean>(
		condition: GridFilterCondition<TConditionValue>
	): void {
		let children: JQuery[] = [];

		children.push(condition.$input);

		let finalLabel: JQuery[] = [this.$label(condition.id, condition.name)];

		if (condition.data && condition.data?.size > 0) {
			finalLabel.push(this.$label(condition.id, " ( "));

			let index = -1;

			condition.data.forEach((subCondition) => {
				index++;

				this.appendSubCondition(condition, subCondition, finalLabel);

				if (index < 1) {
					return;
				}

				finalLabel.push(this.$label(condition.id, ", "));
			});

			finalLabel.push(this.$label(condition.id, " )"));
		}

		children.push(...finalLabel);

		this._$conditionsContainer.append($("<div>").append(...children));
	}

	private appendSubCondition<TConditionValue, TSubConditionValue>(
		mainCondition: GridFilterCondition<TConditionValue>,
		subCondition: GridFilterData<TSubConditionValue>,
		finalLabel: JQuery[]
	): void {
		finalLabel.push(
			$("<label>", {
				for: mainCondition.$input.attr("id"),
				text: `${subCondition.name}: `,
			})
		);

		finalLabel.push(subCondition.$input);
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
