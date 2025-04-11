import React, { useState } from "react";

const ToggleSwitch = ({ id = "isWeekend", checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked || false);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    if (onChange) onChange(newState);
  };

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
        id={id}
        onClick={handleToggle}
      >
        <span
          data-state={isChecked ? "checked" : "unchecked"}
          className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        />
      </button>
      <input
        aria-hidden="true"
        tabIndex={-1}
        type="checkbox"
        checked={isChecked}
        readOnly
        className="hidden"
      />
    </div>
  );
};

export default ToggleSwitch;
