import styled from 'styled-components';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CustomSwitch({ checked, onChange, disabled }: CustomSwitchProps) {
  return (
    <StyledWrapper>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .switch {
    --button-width: 3.5em;
    --button-height: 2em;
    --toggle-diameter: 1.5em;
    --button-toggle-offset: calc((var(--button-height) - var(--toggle-diameter)) / 2);
    --toggle-shadow-offset: 10px;
    --toggle-wider: 3em;
    --color-grey: #cccccc;
    --color-green: #4296f4;
  }

  .slider {
    display: inline-block;
    width: var(--button-width);
    height: var(--button-height);
    background-color: var(--color-grey);
    border-radius: calc(var(--button-height) / 2);
    position: relative;
    transition: 0.3s all ease-in-out;
  }

  .slider::after {
    content: "";
    display: inline-block;
    width: var(--toggle-diameter);
    height: var(--toggle-diameter);
    background-color: #fff;
    border-radius: calc(var(--toggle-diameter) / 2);
    position: absolute;
    top: var(--button-toggle-offset);
    transform: translateX(var(--button-toggle-offset));
    box-shadow: var(--toggle-shadow-offset) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
    transition: 0.3s all ease-in-out;
  }

  .switch input[type="checkbox"]:checked + .slider {
    background-color: var(--color-green);
  }

  .switch input[type="checkbox"]:checked + .slider::after {
    transform: translateX(calc(var(--button-width) - var(--toggle-diameter) - var(--button-toggle-offset)));
    box-shadow: calc(var(--toggle-shadow-offset) * -1) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
  }

  .switch input[type="checkbox"] {
    display: none;
  }

  .switch input[type="checkbox"]:active + .slider::after {
    width: var(--toggle-wider);
  }

  .switch input[type="checkbox"]:checked:active + .slider::after {
    transform: translateX(calc(var(--button-width) - var(--toggle-wider) - var(--button-toggle-offset)));
  }

  .switch input[type="checkbox"]:disabled + .slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
`; 