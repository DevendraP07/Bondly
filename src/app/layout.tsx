import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "Bondly — Find Your Match",
	description: "Connect with people who share your interests and values",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html className={GeistSans.variable} lang="en">
			<body>
				<TRPCReactProvider>
					<TooltipProvider>
						{children}
						<Toaster position="top-right" richColors />
					</TooltipProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
