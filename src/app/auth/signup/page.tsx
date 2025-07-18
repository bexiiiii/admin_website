import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | FoodSave Admin",
  description: "Create a new account for FoodSave Admin Dashboard",
};

export default function SignUp() {
  return <SignUpForm />;
}
