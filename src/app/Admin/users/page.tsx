"use client";

import { SearchIcon, ShieldOffIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function AdminUsersPage() {
	const [search, setSearch] = useState("");
	const {
		data: users,
		isLoading,
		refetch,
	} = api.profile.getAllUsers.useQuery();

	const setBlocked = api.profile.setBlocked.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: (_, vars) => {
			void refetch();
			toast.success(vars.block ? "User blocked." : "User unblocked.");
		},
	});

	const filtered =
		users?.filter((u) => {
			if (!search) return true;
			const q = search.toLowerCase();
			return (
				u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
			);
		}) ?? [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-black text-3xl text-gray-900">Users</h1>
				<p className="mt-1 text-gray-500 text-sm">
					Manage all registered users
				</p>
			</div>

			<div className="relative">
				<SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					className="border-rose-100 pl-9"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name or email..."
					value={search}
				/>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton className="h-20 rounded-2xl" key={i} />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 border-dashed py-16 text-center">
					<UsersIcon className="mb-3 h-10 w-10 text-rose-200" />
					<p className="text-gray-500 text-sm">No users found</p>
				</div>
			) : (
				<div className="space-y-2">
					{filtered.map((u) => (
						<div
							className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white p-4"
							key={u.id}
						>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-bold text-gray-900">{u.name}</p>
									{u.isPremium && (
										<Badge className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] text-white">
											✨ Premium
										</Badge>
									)}
									{u.isBlocked && (
										<Badge className="border-0 bg-red-100 text-[10px] text-red-600">
											Blocked
										</Badge>
									)}
									<Badge className="border-rose-100 bg-rose-50 text-[10px] text-rose-600 capitalize">
										{u.role}
									</Badge>
								</div>
								<p className="mt-0.5 text-gray-500 text-xs">{u.email}</p>
								<p className="mt-0.5 text-gray-400 text-xs">
									Joined{" "}
									{new Date(u.createdAt).toLocaleDateString("en-IN", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</p>
							</div>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										className={`h-8 border text-xs ${
											u.isBlocked
												? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
												: "border-red-200 text-red-500 hover:bg-red-50"
										}`}
										size="sm"
										variant="outline"
									>
										<ShieldOffIcon className="mr-1 h-3 w-3" />
										{u.isBlocked ? "Unblock" : "Block"}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{u.isBlocked ? "Unblock" : "Block"} {u.name}?
										</AlertDialogTitle>
										<AlertDialogDescription>
											{u.isBlocked
												? "This user will regain full platform access."
												: "This user will no longer be able to use the platform."}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											className={
												u.isBlocked
													? "border-0 bg-emerald-500 text-white hover:bg-emerald-600"
													: "border-0 bg-red-500 text-white hover:bg-red-600"
											}
											onClick={() =>
												setBlocked.mutate({ block: !u.isBlocked, userId: u.id })
											}
										>
											{u.isBlocked ? "Unblock" : "Block"} User
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
