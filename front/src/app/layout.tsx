import type { Metadata } from "next";
import "./globals.css";

import NavBar from "@/components/navBar/NavBar";
import Footer from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* se creo las etiquetas herder, main y footer para organizar los diferentes componentes mateniendo el footer siempre en la parte de abajo */}
        <div className="containerPrincipal">
          <header>
            <NavBar />
          </header>
          <main className="mt-14">
            {children}
          </main>
          <footer>
            <Footer/>
          </footer>
        </div>
      </body>
    </html>
  );
}
