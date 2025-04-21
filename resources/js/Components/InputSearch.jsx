import TextInput from '@/Components/TextInput';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';


export default function InputSearch({ onSearchChange, placeHolderText = "Buscando usuarios", valueInput = "" }) {
    const [inputValue, setInputValue] = useState('');
    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (onSearchChange) onSearchChange(value);
    };

    useEffect(() => {
        setInputValue(valueInput);
    }, [valueInput]);
    return (
        <div className="flex items-center space-x-2">
            <div className="relative flex-1">
                <Search className='absolute lucide lucide-search absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                <TextInput
                    id="search"
                    type="text"
                    name="InputSearch"
                    value={inputValue}
                    onChange={handleChange}
                    className="px-8 w-full"
                    placeholder={placeHolderText}
                />
                {/* <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8" placeholder="Buscar usuarios..." value="" /> */}
            </div>

        </div>
    );
}
