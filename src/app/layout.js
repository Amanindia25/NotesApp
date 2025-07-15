"use client";
import "@/app/globals.css";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabaseClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      }

      // Optional: listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
    };

    getSession();
  }, []);

  return (
    <html lang="en">
      <body>
        {/* You can pass `user` to Navbar if needed */}
        <Navbar />
        <main className="p-4 pt-24 pb-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
