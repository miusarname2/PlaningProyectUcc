import InputLabel from '@/Components/InputLabel';
import BaseCheckbox from '@/Components/BaseCheckbox';

export default function CheckboxInput({ id, label, checked, onChange }) {
    return (
        <div className="flex items-center space-x-2">
            <BaseCheckbox
                id={id}
                checked={checked}
                onChange={onChange}
            />
            <InputLabel
                htmlFor={id}
                className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-normal cursor-pointer"
            >
                {label}
            </InputLabel>
        </div>
    );
}
