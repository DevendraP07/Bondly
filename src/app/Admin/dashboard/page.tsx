"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function AdminDashboard() {
	const { data: users, isLoading } = api.profile.getAllUsers.useQuery();
	const { data: reports } = api.report.getAll.useQuery();

	const totalUsers = users?.length ?? 0;
	const premiumUsers = users?.filter((u) => u.isPremium).length ?? 0;
	const blockedUsers = users?.filter((u) => u.isBlocked).length ?? 0;
	const pendingReports =
		reports?.filter((r) => r.status === "pending").length ?? 0;

	const stats = [
		{ color: "text-blue-500", label: "Total Users", value: totalUsers },
		{ color: "text-rose-500", label: "Premium Users", value: premiumUsers },
		{ color: "text-red-500", label: "Blocked Users", value: blockedUsers },
		{
			color: "text-amber-500",
			label: "Pending Reports",
			value: pendingReports,
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-black text-3xl text-gray-900">Admin Dashboard</h1>
				<p className="mt-1 text-gray-500 text-sm">
					Platform overview and management
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{stats.map((s) => (
					<div
						className="rounded-2xl border border-rose-100 bg-white p-5"
						key={s.label}
					>
						{isLoading ? (
							<Skeleton className="h-8 w-12" />
						) : (
							<p className="font-black text-3xl text-gray-900">{s.value}</p>
						)}
						<p className={`mt-1 text-xs ${s.color}`}>{s.label}</p>
					</div>
				))}
			</div>

			{/* QUICK LINKS */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{[
					{
						desc: "View and block registered users",
						emoji: "👥",
						href: "/Admin/users",
						label: "Manage Users",
					},
					{
						desc: "Review and resolve user reports",
						emoji: "🛡️",
						href: "/Admin/reports",
						label: "Manage Reports",
					},
				].map((a) => (
					<Link href={a.href} key={a.label}>
						<div className="cursor-pointer rounded-2xl border border-rose-100 bg-white p-5 transition-all hover:border-rose-200 hover:shadow-sm">
							<div className="mb-3 text-3xl">{a.emoji}</div>
							<p className="font-bold text-gray-900">{a.label}</p>
							<p className="mt-1 text-gray-500 text-xs">{a.desc}</p>
						</div>
					</Link>
				))}
			</div>

			{/* RECENT USERS */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-gray-900 text-lg">Recent Users</h2>
					<Link
						className="text-rose-500 text-xs transition hover:text-rose-600"
						href="/Admin/users"
					>
						View all →
					</Link>
				</div>
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<Skeleton className="h-16 rounded-2xl" key={i} />
						))}
					</div>
				) : (
					<div className="space-y-2">
						{users?.slice(0, 5).map((u) => (
							<div
								className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4"
								key={u.id}
							>
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-semibold text-gray-900">{u.name}</p>
										{u.isPremium && (
											<Badge className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] text-white">
												Premium
											</Badge>
										)}
										{u.isBlocked && (
											<Badge className="border-0 bg-red-100 text-[10px] text-red-600">
												Blocked
											</Badge>
										)}
									</div>
									<p className="text-gray-500 text-xs">{u.email}</p>
								</div>
								<p className="text-gray-400 text-xs capitalize">{u.role}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
