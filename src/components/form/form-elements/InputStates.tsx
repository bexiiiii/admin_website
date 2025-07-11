"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../input/InputField";
import Label from "../Label";

export default function InputStates() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  // Simulate a validation check
  const validateEmail = (value: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setError(!isValidEmail);
    return isValidEmail;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  return (
    <ComponentCard
      title="Input States"
      desc="Validation styles for error, success and disabled states on form controls."
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Error Input */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            defaultValue={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-500 mt-1">This is an invalid email address.</p>}
        </div>

        {/* Success Input */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            defaultValue={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            className={!error ? "border-green-500" : ""}
          />
          {!error && <p className="text-sm text-green-500 mt-1">Valid email!</p>}
        </div>

        {/* Disabled Input */}
        <div>
          <Label>Email</Label>
          <Input
            type="text"
            defaultValue="disabled@example.com"
            disabled={true}
            placeholder="Disabled email"
          />
          <p className="text-sm text-gray-500 mt-1">This field is disabled.</p>
        </div>
      </div>
    </ComponentCard>
  );
}
