"use client";
import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import supabase from "@/app/lib/supabaseClient";
import Link from "next/link";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (password !== repassword) {
      return setMessage("❌ Passwords do not match");
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(
      { email, password },
      { data: { username } }
    );
    setLoading(false);
    if (error) return setMessage(`❌ ${error.message}`);
    setMessage("✅ Check your email!");
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <CardContent className="space-y-4">
        <h2>Create Account</h2>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <Input
          placeholder="Confirm Password"
          type="password"
          value={repassword}
          onChange={(e) => setRepassword(e.target.value)}
        />
        <Button onClick={handleSignup} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🔄</span> Signing Up...
            </span>
          ) : (
            "Sign Up"
          )}
        </Button>
        {message && <p className="text-sm text-red-500">{message}</p>}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
