"use client";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import supabase from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 border-b bg-header-footer-bg text-header-footer-foreground shadow-md">
      <h1 className="text-xl font-bold">📝 Notes App</h1>
      <div className="flex gap-4">
        {!user ? (
          <>
            <Link href="/signup">
              <Button>Signup</Button>
            </Link>
            <Link href="/signin">
              <Button>Signin</Button>
            </Link>
          </>
        ) : (
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
