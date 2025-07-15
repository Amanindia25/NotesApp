"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ FIXED
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import supabase from "@/app/lib/supabaseClient";
import Link from "next/link";

export default function Signin() {
  const router = useRouter(); // ✅ FIXED
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      setMessage("❌ Invalid credentials");
    } else {
      setMessage("✅ Logged in! Redirecting…");
      router.push("/auth/callback"); // ✅ Redirect works now
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Login</h2>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <Input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <Button onClick={handleSignin} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🔄</span> Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
        {message && <p className="text-sm text-red-500">{message}</p>}
        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
