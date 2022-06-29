class LogExtend {
    static log(callerFunction, message, ...args) {
        Logger.log(this, callerFunction, message, ...args);
    }
    static error(callerFunction, message, ...args) {
        Logger.error(this, callerFunction, message, ...args);
    }
}
class Logger {
    static chosenStyle = 1;
    static log(callerClass, callerFunction, message, ...args) {
        if (SoundboardApi.isProduction)
            return;
        this.logInfo(callerClass, callerFunction, message, ...args);
    }
    static error(callerClass, callerFunction, message, ...args) {
        if (SoundboardApi.isProduction)
            return;
        this.logError(callerClass, callerFunction, message, ...args);
    }
    static logInfo(callerClass, callerFunction, message, ...args) {
        let attributes = this.getStyledAttributes(callerClass, callerFunction, message);
        console.info(attributes[0], ...attributes[1], ...args);
    }
    static logError(callerClass, callerFunction, message, ...args) {
        let attributes = this.getStyledAttributes(callerClass, callerFunction, message);
        console.error(attributes[0], ...attributes[1], ...args);
    }
    static getHslFromString(str, lightness) {
        return `hsl(${this.getHueFromString(str)}, 100%, ${lightness}%)`;
    }
    static getHueFromString(str) {
        let hash = 0;
        if (str.length === 0)
            return hash;
        hash = this.getHashFromString(str);
        const result = hash % 360;
        if (result < 0)
            return result + 360;
        else
            return result;
    }
    static getHashFromString(str) {
        let hash = 0;
        if (str.length === 0)
            return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash;
    }
    static getStyledAttributes(callerClass, callerFunction, message) {
        switch (this.chosenStyle) {
            case 0:
                return this.style0(callerClass, callerFunction, message);
            default:
                return this.style1(callerClass, callerFunction, message);
        }
    }
    static style0(callerClass, callerFunction, message) {
        const shadowEffect = "text-shadow: 0 .5px 3px rgb(255 255 255 / .1)";
        const boldEffect = "font-weight: bold";
        let callerClassName = "-";
        let callerClassProperties = [];
        if (callerClass?.name != null) {
            callerClassName = `%c${callerClass.name}`;
            callerClassProperties.push(`color: ${this.getHslFromString(callerClass.name, 70)};
				${boldEffect};
				${shadowEffect}`);
        }
        let callerFunctionName = "-";
        let callerFunctionProperties = [];
        if (callerFunction?.name != null) {
            callerFunctionName = `%c${callerFunction.name}`;
            callerFunctionProperties.push(`color: ${this.getHslFromString(callerFunction.name, 70)};
				${boldEffect};
				${shadowEffect}`);
        }
        return [
            `%c[${callerClassName}%c] (${callerFunctionName}%c) → ` + message,
            [
                "color: inherit; margin: 5px 0",
                ...callerClassProperties,
                "color: inherit",
                ...callerFunctionProperties,
                "color: inherit",
            ],
        ];
    }
    static style1(callerClass, callerFunction, message) {
        const colorName = callerFunction?.name ?? callerClass?.name ?? "???";
        const bgColor = this.getHslFromString(colorName, 20);
        const fgColor = this.getHslFromString(colorName, 90);
        const headerStartEffect = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 15px 0 0 15px; padding: 2px 0 2px 2px; margin: 5px 0; border-width: 2px 0 2px 2px; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
        const headerMiddleEffect = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0; padding: 2px 0; margin-left: -0.4px; border-width: 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
        const headerEndEffect = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0 15px 15px 0; padding: 2px 2px 2px 0; margin-left: -0.4px; border-width: 2px 2px 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
        let callerClassName = "%c...";
        let callerClassProperties = [headerMiddleEffect];
        if (callerClass?.name != null) {
            callerClassName = `%c${callerClass.name}`;
        }
        let callerFunctionName = "";
        let callerFunctionProperties = [];
        if (callerFunction?.name != null) {
            callerFunctionName = `%c → %c${callerFunction.name}`;
            callerFunctionProperties = [headerMiddleEffect, headerMiddleEffect];
        }
        return [
            `%c ${callerClassName}${callerFunctionName}%c %c ` + message,
            [
                headerStartEffect,
                ...callerClassProperties,
                ...callerFunctionProperties,
                headerEndEffect,
                "color: inherit",
            ],
        ];
    }
}
