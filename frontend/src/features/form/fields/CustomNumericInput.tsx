import { Classes, Intent } from "@blueprintjs/core";
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState
} from "react";
import fieldStyles from "../styles/FormFields.module.scss";

export interface CustomNumericInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value" | "defaultValue"> {
	/**
	 * Whether negative numbers (and typing '-') are allowed.
	 * Defaults to false (only positive numbers allowed, '-' is blocked).
	 */
	allowNegative?: boolean;

	/**
	 * Controlled value.
	 */
	value?: number | string;

	/**
	 * Uncontrolled default value.
	 */
	defaultValue?: number | string;

	/**
	 * Minimum allowed value.
	 */
	min?: number;

	/**
	 * Maximum allowed value.
	 */
	max?: number;

	/**
	 * Step size for increment/decrement buttons and arrow keys.
	 * Defaults to 1.
	 */
	stepSize?: number;

	/**
	 * Increment when Shift key is held. Defaults to 10.
	 */
	majorStepSize?: number | null;

	/**
	 * Increment when Alt key is held. Defaults to 0.1.
	 */
	minorStepSize?: number | null;

	/**
	 * Whether to clamp value to [min, max] on blur. Defaults to true.
	 */
	clampValueOnBlur?: boolean;

	/**
	 * Whether to restrict input to numeric characters. Defaults to true.
	 */
	allowNumericCharactersOnly?: boolean;

	/**
	 * Position of the stepper buttons. Defaults to "right". Use "none" to hide.
	 */
	buttonPosition?: "none" | "left" | "right";

	/**
	 * Visual intent / error state (e.g. "danger" | Intent.DANGER).
	 */
	intent?: Intent | "none" | "primary" | "success" | "warning" | "danger";

	/**
	 * Size variant.
	 */
	size?: "small" | "medium" | "large";
	small?: boolean;
	large?: boolean;

	/**
	 * Whether the input should take 100% width of its parent.
	 */
	fill?: boolean;

	/**
	 * Callback providing parsed number and formatted string.
	 */
	onValueChange?: (valueAsNumber: number, valueAsString: string, inputElement: HTMLInputElement | null) => void;

	/**
	 * Change handler for React Hook Form or standard change handlers.
	 */
	onChange?: ((value: number) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void) | any;

	/**
	 * Legacy inputRef prop.
	 */
	inputRef?: React.Ref<HTMLInputElement>;

	/**
	 * Whether to select text on focus.
	 */
	selectAllOnFocus?: boolean;
}

function getFallbackValue(min?: number, max?: number): number {
	if (min !== undefined && min > 0) {
		return min;
	}
	if (max !== undefined && max < 0) {
		return max;
	}
	return 0;
}

function normalizeNumericString(str: string, allowNegative: boolean): string {
	if (str.trim() === "") {
		return "";
	}
	let isNeg = false;
	let s = str.trim();
	if (allowNegative && s.startsWith("-")) {
		isNeg = true;
		s = s.slice(1);
	}
	if (s.startsWith(".")) {
		s = "0" + s;
	}
	if (s.includes(".")) {
		const parts = s.split(".");
		const integerPart = parts[0].replace(/^0+(?=\d)/, "");
		return (isNeg ? "-" : "") + (integerPart === "" ? "0" : integerPart) + "." + parts.slice(1).join("");
	}
	const integerPart = s.replace(/^0+(?=\d)/, "");
	return (isNeg ? "-" : "") + (integerPart === "" ? "0" : integerPart);
}

function countDecimals(n: number): number {
	if (Math.floor(n) === n) return 0;
	const s = n.toString();
	return s.includes(".") ? s.split(".")[1].length : 0;
}

export const CustomNumericInput = React.forwardRef<HTMLInputElement, CustomNumericInputProps>(
	(props, ref) => {
		const {
			allowNegative = false,
			value,
			defaultValue,
			min,
			max,
			stepSize = 1,
			majorStepSize = 10,
			minorStepSize = 0.1,
			clampValueOnBlur = true,
			allowNumericCharactersOnly = true,
			buttonPosition = "right",
			intent,
			size = "small",
			small,
			large,
			fill,
			disabled,
			readOnly,
			className,
			style,
			id,
			placeholder,
			title,
			onValueChange,
			onChange,
			onBlur,
			onFocus,
			onKeyDown,
			inputRef: inputRefProp,
			selectAllOnFocus = false,
			...restProps
		} = props;

		const inputRef = useRef<HTMLInputElement | null>(null);
		const isFocusedRef = useRef(false);

		// Synchronize forwarded ref and inputRefProp
		useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
		useEffect(() => {
			if (inputRefProp) {
				if (typeof inputRefProp === "function") {
					inputRefProp(inputRef.current);
				} else if ("current" in inputRefProp) {
					(inputRefProp as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
				}
			}
		}, [inputRefProp]);

		// Initial display string
		const [textValue, setTextValue] = useState<string>(() => {
			if (value !== undefined && value !== null) {
				return value.toString();
			}
			if (defaultValue !== undefined && defaultValue !== null) {
				return defaultValue.toString();
			}
			return getFallbackValue(min, max).toString();
		});

		// Synchronize when controlled value changes externally
		const lastExternalValueRef = useRef(value);
		useEffect(() => {
			if (value !== lastExternalValueRef.current) {
				lastExternalValueRef.current = value;
				if (!isFocusedRef.current) {
					setTextValue(
						value !== undefined && value !== null
							? value.toString()
							: getFallbackValue(min, max).toString()
					);
				} else {
					const currentParsed = Number(textValue);
					if (
						value !== undefined &&
						value !== null &&
						!isNaN(Number(value)) &&
						Number(value) !== currentParsed
					) {
						setTextValue(value.toString());
					}
				}
			}
		}, [value, min, max, textValue]);

		// Emit value changes safely to both onValueChange and onChange/React Hook Form
		const emitChange = useCallback(
			(numVal: number, strVal: string, originalEvent?: React.SyntheticEvent) => {
				if (onValueChange) {
					onValueChange(numVal, strVal, inputRef.current);
				}
				if (onChange && onChange !== onValueChange) {
					const syntheticEvent = originalEvent
						? Object.assign({}, originalEvent, {
								target: Object.assign({}, (originalEvent as any).target, {
									value: numVal,
									name: (restProps as any).name
								})
						  })
						: {
								target: {
									value: numVal,
									name: (restProps as any).name
								}
						  };
					onChange(syntheticEvent as any);
				}
			},
			[onChange, onValueChange, restProps]
		);

		// Increment / decrement stepping
		const handleStep = useCallback(
			(direction: 1 | -1, e?: React.MouseEvent | React.KeyboardEvent) => {
				if (disabled || readOnly) return;
				const isShift = e?.shiftKey ?? false;
				const isAlt = e?.altKey ?? false;

				const delta =
					isShift && majorStepSize != null
						? direction * majorStepSize
						: isAlt && minorStepSize != null
						? direction * minorStepSize
						: direction * (stepSize ?? 1);

				const currentNum = isNaN(Number(textValue))
					? getFallbackValue(min, max)
					: Number(textValue);

				let nextNum = currentNum + delta;

				const decimals = Math.max(
					countDecimals(stepSize ?? 1),
					isAlt && minorStepSize != null ? countDecimals(minorStepSize) : 0
				);
				if (decimals > 0) {
					nextNum = Number(nextNum.toFixed(Math.min(decimals, 8)));
				}

				if (min !== undefined && nextNum < min) nextNum = min;
				if (max !== undefined && nextNum > max) nextNum = max;

				const nextStr = nextNum.toString();
				setTextValue(nextStr);
				emitChange(nextNum, nextStr, e);
			},
			[disabled, readOnly, majorStepSize, minorStepSize, stepSize, textValue, min, max, emitChange]
		);

		// Continuous mouse hold on stepper buttons
		const holdTimeoutRef = useRef<number | null>(null);
		const holdIntervalRef = useRef<number | null>(null);

		const stopHold = useCallback(() => {
			if (holdTimeoutRef.current !== null) {
				window.clearTimeout(holdTimeoutRef.current);
				holdTimeoutRef.current = null;
			}
			if (holdIntervalRef.current !== null) {
				window.clearInterval(holdIntervalRef.current);
				holdIntervalRef.current = null;
			}
		}, []);

		const startHold = useCallback(
			(direction: 1 | -1, e: React.MouseEvent) => {
				e.preventDefault();
				if (disabled || readOnly) return;
				handleStep(direction, e);
				stopHold();
				holdTimeoutRef.current = window.setTimeout(() => {
					holdIntervalRef.current = window.setInterval(() => {
						handleStep(direction, e);
					}, 60);
				}, 300);
			},
			[disabled, readOnly, handleStep, stopHold]
		);

		useEffect(() => {
			return () => stopHold();
		}, [stopHold]);

		// KeyDown handler: blocks illegal characters and intercepts backspace/delete to prevent empty fields
		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (disabled || readOnly) {
				onKeyDown?.(e);
				return;
			}

			const input = e.currentTarget;
			const selStart = input.selectionStart ?? 0;
			const selEnd = input.selectionEnd ?? 0;
			const curVal = input.value;
			const fallback = getFallbackValue(min, max);

			// 1. Block 'e' and 'E'
			if (e.key === "e" || e.key === "E") {
				e.preventDefault();
				return;
			}

			// 2. Block '-' and '+' if allowNegative is false
			if (!allowNegative && (e.key === "-" || e.key === "+")) {
				e.preventDefault();
				return;
			}

			// 3. Arrow keys stepping
			if (e.key === "ArrowUp") {
				e.preventDefault();
				handleStep(1, e);
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				handleStep(-1, e);
				return;
			}

			// 4. PREVENT EMPTY FIELD:
			// If all text is selected and user presses Backspace or Delete
			if ((e.key === "Backspace" || e.key === "Delete") && selStart === 0 && selEnd === curVal.length) {
				e.preventDefault();
				const fallbackStr = fallback.toString();
				setTextValue(fallbackStr);
				emitChange(fallback, fallbackStr, e);
				setTimeout(() => {
					if (inputRef.current) {
						inputRef.current.select();
					}
				}, 0);
				return;
			}

			// If only 1 character is present (e.g. "5") and user hits Backspace at position 1
			if (e.key === "Backspace" && selStart === 1 && selEnd === 1 && curVal.length === 1) {
				e.preventDefault();
				const fallbackStr = fallback.toString();
				setTextValue(fallbackStr);
				emitChange(fallback, fallbackStr, e);
				setTimeout(() => {
					if (inputRef.current) {
						inputRef.current.select();
					}
				}, 0);
				return;
			}

			// If only 1 character is present and user hits Delete at position 0
			if (e.key === "Delete" && selStart === 0 && selEnd === 0 && curVal.length === 1) {
				e.preventDefault();
				const fallbackStr = fallback.toString();
				setTextValue(fallbackStr);
				emitChange(fallback, fallbackStr, e);
				setTimeout(() => {
					if (inputRef.current) {
						inputRef.current.select();
					}
				}, 0);
				return;
			}

			// If allowNegative is true and input only has "-" and user hits Backspace
			if (allowNegative && e.key === "Backspace" && curVal === "-" && selStart === 1 && selEnd === 1) {
				e.preventDefault();
				const fallbackStr = fallback.toString();
				setTextValue(fallbackStr);
				emitChange(fallback, fallbackStr, e);
				setTimeout(() => {
					if (inputRef.current) {
						inputRef.current.select();
					}
				}, 0);
				return;
			}

			onKeyDown?.(e);
		};

		// Input Change Handler: sanitizes numbers and handles paste/typing
		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			let raw = e.target.value;
			const fallback = getFallbackValue(min, max);

			if (raw.trim() === "") {
				const fallbackStr = fallback.toString();
				setTextValue(fallbackStr);
				emitChange(fallback, fallbackStr, e);
				setTimeout(() => {
					if (inputRef.current) {
						inputRef.current.select();
					}
				}, 0);
				return;
			}

			if (allowNumericCharactersOnly) {
				let sanitized = "";
				let hasDecimal = false;
				let hasMinus = false;
				for (let i = 0; i < raw.length; i++) {
					const ch = raw[i];
					if (ch === "-" && allowNegative && i === 0 && !hasMinus) {
						sanitized += "-";
						hasMinus = true;
					} else if (ch === "." && !hasDecimal) {
						sanitized += ".";
						hasDecimal = true;
					} else if (ch >= "0" && ch <= "9") {
						sanitized += ch;
					}
				}
				raw = sanitized;
			}

			if (raw === "" || raw === "-") {
				if (raw === "-") {
					setTextValue("-");
					// Do not emit NaN
				} else {
					const fallbackStr = fallback.toString();
					setTextValue(fallbackStr);
					emitChange(fallback, fallbackStr, e);
				}
				return;
			}

			const normalized = normalizeNumericString(raw, allowNegative);
			setTextValue(normalized);

			const num = Number(normalized);
			if (!isNaN(num)) {
				emitChange(num, normalized, e);
			}
		};

		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			isFocusedRef.current = true;
			if (selectAllOnFocus) {
				e.currentTarget.select();
			}
			onFocus?.(e);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			isFocusedRef.current = false;
			const fallback = getFallbackValue(min, max);

			let finalStr = textValue.trim();
			if (finalStr === "" || finalStr === "-" || isNaN(Number(finalStr))) {
				finalStr = fallback.toString();
			} else if (clampValueOnBlur) {
				let num = Number(finalStr);
				if (min !== undefined && num < min) {
					num = min;
				}
				if (max !== undefined && num > max) {
					num = max;
				}
				finalStr = num.toString();
			}

			setTextValue(finalStr);
			const finalNum = Number(finalStr);
			if (!isNaN(finalNum)) {
				emitChange(finalNum, finalStr, e);
			}

			onBlur?.(e);
		};

		// Classes & Styling
		const isSmall = size === "small" || small === true;
		const isLarge = size === "large" || large === true;

		const intentStr = intent ? String(intent) : "";
		const intentClass =
			intentStr === "danger"
				? Classes.INTENT_DANGER
				: intentStr === "primary"
				? Classes.INTENT_PRIMARY
				: intentStr === "warning"
				? Classes.INTENT_WARNING
				: intentStr === "success"
				? Classes.INTENT_SUCCESS
				: "";

		const containerClasses = [
			Classes.CONTROL_GROUP,
			Classes.NUMERIC_INPUT,
			isSmall ? Classes.SMALL : "",
			isLarge ? Classes.LARGE : "",
			fill ? Classes.FILL : "",
			disabled ? Classes.DISABLED : "",
			fieldStyles.compactNumericInput,
			className
		]
			.filter(Boolean)
			.join(" ");

		const inputClasses = [
			Classes.INPUT,
			isSmall ? Classes.SMALL : "",
			isLarge ? Classes.LARGE : "",
			fill ? Classes.FILL : "",
			intentClass
		]
			.filter(Boolean)
			.join(" ");

		const curNum = Number(textValue);
		const isIncrementDisabled =
			disabled || readOnly || (max !== undefined && !isNaN(curNum) && curNum >= max);
		const isDecrementDisabled =
			disabled || readOnly || (min !== undefined && !isNaN(curNum) && curNum <= min);

		const renderButtons = () => (
			<div className={`${Classes.BUTTON_GROUP} ${Classes.VERTICAL} ${Classes.FIXED}`}>
				<button
					type="button"
					tabIndex={-1}
					className={`${Classes.BUTTON} ${isSmall ? Classes.SMALL : ""}`}
					disabled={isIncrementDisabled}
					onMouseDown={(e) => startHold(1, e)}
					onMouseUp={stopHold}
					onMouseLeave={stopHold}
					aria-label="increment"
				>
					<span className={Classes.ICON}>
						<svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
							<path d="M12.7 10.3a1 1 0 0 1-1.4 0L8 7l-3.3 3.3a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4z" />
						</svg>
					</span>
				</button>
				<button
					type="button"
					tabIndex={-1}
					className={`${Classes.BUTTON} ${isSmall ? Classes.SMALL : ""}`}
					disabled={isDecrementDisabled}
					onMouseDown={(e) => startHold(-1, e)}
					onMouseUp={stopHold}
					onMouseLeave={stopHold}
					aria-label="decrement"
				>
					<span className={Classes.ICON}>
						<svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
							<path d="M3.3 5.7a1 1 0 0 1 1.4 0L8 9l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
						</svg>
					</span>
				</button>
			</div>
		);

		return (
			<div className={containerClasses} style={style}>
				{buttonPosition === "left" && renderButtons()}
				<div className={`${Classes.INPUT_GROUP} ${isSmall ? Classes.SMALL : ""} ${fill ? Classes.FILL : ""}`}>
					<input
						{...restProps}
						ref={inputRef}
						id={id}
						type="text"
						inputMode="decimal"
						autoComplete="off"
						disabled={disabled}
						readOnly={readOnly}
						placeholder={placeholder}
						title={title}
						className={inputClasses}
						value={textValue}
						onFocus={handleFocus}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						onChange={handleInputChange}
						aria-invalid={intentStr === "danger" ? true : undefined}
						aria-valuemin={min}
						aria-valuemax={max}
						aria-valuenow={isNaN(Number(textValue)) ? undefined : Number(textValue)}
					/>
				</div>
				{buttonPosition !== "none" && buttonPosition !== "left" && renderButtons()}
			</div>
		);
	}
);

CustomNumericInput.displayName = "CustomNumericInput";

export const CustomNumericalInput = CustomNumericInput;

export default CustomNumericInput;
