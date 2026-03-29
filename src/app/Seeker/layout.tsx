import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { getSession } from "@/server/better-auth/server";

export default async function SeekerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();
	if (!session?.user) redirect("/login");
	// ts-expect-error — additionalFields
	const role = session.user.role as string;
	if (role === "admin") redirect("/Admin/dashboard");

	const u = {
		email: session.user.email,
		id: session.user.id,
		isPremium: role === "premium",
		name: session.user.name,
		role,
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30">
			<AppNavbar user={u} />
			<main className="mx-auto max-w-5xl px-4 py-6 md:px-6">{children}</main>
		</div>
	);
}
