import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import TextInput from '@/Components/TextInput';


export default function PasswordInputWithToggle({ data, setData, defaultValue = "", onChange }) {
  const [showPassword, setShowPassword] = useState(false)
  const [internalPassword, setInternalPassword] = useState(defaultValue)

  const isUsingInternalState = !data || !setData;

  const passwordValue = isUsingInternalState ? internalPassword : data.password;

  // Handle password changes
  const handlePasswordChange = (e) => {
    const newValue = e.target.value;

    if (isUsingInternalState) {
      setInternalPassword(newValue);
      if (onChange) onChange(newValue)
    } else {
      setData("password", newValue);
    }
  }

  return (
    <div className="relative">
      <TextInput
        id="password"
        type={showPassword ? "text" : "password"}
        name="password"
        value={passwordValue}
        className="mt-1 block w-full placeholder:font-black text-black"
        autoComplete="current-password"
        placeholder="••••••••"
        onChange={handlePasswordChange}
      />
      <button
        type="button"
        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

