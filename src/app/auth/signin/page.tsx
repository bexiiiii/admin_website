import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | FoodSave Admin",
  description: "Sign in to FoodSave Admin Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
