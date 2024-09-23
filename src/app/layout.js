import { Inter } from "next/font/google";
import "./globals.css";
import Connector from "./provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className=" w-full h-full absolute flex justify-center ">
        <Connector>{children}</Connector>
      </body>
    </html>
  );
}
