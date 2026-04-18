import { Teko, Jost } from "next/font/google";
import "./globals.css";
import Footer from "./layout/footer/Footer";
import FloatingNavigation from "./layout/navigation/floating-navigation/FloatingNavigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import DarkModeProvider from "./lib/providers/DarkModeProvider";
import { StoreProvider } from "./lib/store/StoreProvider";
import ModalRoot from "./components/modals/ModalRoot";
import Toast from "./components/elements/Toast";
import NavigationWrapper from "./layout/NavigationWrapper";

const josh = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

//444441

export const metadata = {
  title: "DoIt App",
  description: "Task management application",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${josh.variable} ${teko.variable} h-full antialiased primary`}
    >
      <body className="min-h-full flex flex-col items-center relative overflow-x-hidden">
        <NextIntlClientProvider>
          <StoreProvider>
            <DarkModeProvider>
              {/* <Navigation /> */}
              <NavigationWrapper />
              <div className="center w-full flex-col *:w-full grow *:grow ">
                {children}
              </div>
              <ModalRoot />
              <FloatingNavigation />
              <Toast />
              <Footer />
            </DarkModeProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
