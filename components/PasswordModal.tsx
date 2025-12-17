import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const CALENDAR_PASSWORD = "HolaCalendarioTH123*"

interface Props {
    onSuccess: () => void;
}

export default function PasswordModal({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (password === CALENDAR_PASSWORD) {
      onSuccess();
    } else {
      setError("Contraseña incorrecta");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Acceso al calendario</h2>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contraseña"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2.5 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
