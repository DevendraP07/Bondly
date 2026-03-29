"use client";

import {
	BellIcon,
	HeartIcon,
	LayoutDashboardIcon,
	LogOutIcon,
	MessageCircleIcon,
	SearchIcon,
	ShieldIcon,
	SparklesIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";

type NavLink = { href: string; icon: React.ElementType; label: string };

function getSeekerLinks(isPremium: boolean): NavLink[] {
	return [
		{
			href: "/Seeker/dashboard",
			icon: LayoutDashboardIcon,
			label: "Dashboard",
		},
		{ href: "/Seeker/discover", icon: SearchIcon, label: "Discover" },
		{ href: "/Seeker/matches", icon: HeartIcon, label: "Matches" },
		{ href: "/Seeker/messages", icon: MessageCircleIcon, label: "Messages" },
		...(isPremium
			? [{ href: "/Seeker/premium", icon: SparklesIcon, label: "Premium" }]
			: [{ href: "/Seeker/premium", icon: SparklesIcon, label: "Go Premium" }]),
	];
}

const adminLinks: NavLink[] = [
	{ href: "/Admin/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
	{ href: "/Admin/users", icon: UsersIcon, label: "Users" },
	{ href: "/Admin/reports", icon: ShieldIcon, label: "Reports" },
];

export function AppNavbar({
	user,
}: {
	user: {
		email: string;
		id: string;
		isPremium: boolean;
		name: string;
		role: string;
	};
}) {
	const router = useRouter();
	const pathname = usePathname();
	const isAdmin = user.role === "admin";
	const links = isAdmin ? adminLinks : getSeekerLinks(user.isPremium);

	const { data: unread } = api.notification.getUnreadCount.useQuery();

	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	async function handleLogout() {
		await authClient.signOut();
		router.push("/");
	}

	const profileHref = "/Seeker/profile";
	const notifHref = "/Seeker/notifications";

	return (
		<header className="sticky top-0 z-50 border-rose-100/80 border-b bg-white/80 backdrop-blur-xl">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
				{/* LOGO */}
				<Link
					className="mr-6 flex shrink-0 items-center gap-1.5"
					href={isAdmin ? "/Admin/dashboard" : "/Seeker/dashboard"}
				>
					<span className="text-xl">💕</span>
					<span className="hidden font-black text-base text-rose-600 sm:block">
						Bondly
					</span>
					{isAdmin && (
						<Badge className="ml-1 border-0 bg-rose-100 text-[10px] text-rose-700">
							Admin
						</Badge>
					)}
				</Link>

				{/* NAV LINKS */}
				<nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
					{links.map((link) => {
						const isActive =
							pathname === link.href || pathname.startsWith(`${link.href}/`);
						return (
							<Link
								className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-sm transition-all ${isActive ? "bg-rose-50 text-rose-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
								href={link.href}
								key={link.href}
							>
								<link.icon className="h-3.5 w-3.5" />
								<span className="hidden md:block">{link.label}</span>
							</Link>
						);
					})}
				</nav>

				{/* RIGHT ACTIONS */}
				<div className="ml-3 flex shrink-0 items-center gap-2">
					{!isAdmin && (
						<Link
							className="relative flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
							href={notifHref}
						>
							<BellIcon className="h-4 w-4" />
							{(unread?.count ?? 0) > 0 && (
								<span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 font-bold text-[8px] text-white">
									{(unread?.count ?? 0) > 9 ? "9+" : unread?.count}
								</span>
							)}
						</Link>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className="flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-2 py-1.5 transition hover:bg-rose-50"
								type="button"
							>
								<Avatar className="h-6 w-6">
									<AvatarFallback className="bg-rose-100 font-bold text-[10px] text-rose-600">
										{initials}
									</AvatarFallback>
								</Avatar>
								<span className="hidden max-w-24 truncate font-medium text-gray-700 text-sm md:block">
									{user.name}
								</span>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuLabel className="font-normal">
								<p className="truncate font-semibold text-gray-900 text-sm">
									{user.name}
								</p>
								<p className="truncate text-muted-foreground text-xs">
									{user.email}
								</p>
								{user.isPremium && (
									<Badge className="mt-1.5 border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] text-white">
										✨ Premium
									</Badge>
								)}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{!isAdmin && (
								<>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={() => router.push(profileHref)}
									>
										<UserIcon className="mr-2 h-4 w-4" /> Profile
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={() => router.push(notifHref)}
									>
										<BellIcon className="mr-2 h-4 w-4" /> Notifications
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="cursor-pointer text-red-500 focus:text-red-500"
								onClick={handleLogout}
							>
								<LogOutIcon className="mr-2 h-4 w-4" /> Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
