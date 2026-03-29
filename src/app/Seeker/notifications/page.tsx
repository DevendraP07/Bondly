"use client";

import { BellOffIcon, CheckCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

const TYPE_ICONS: Record<string, string> = {
	boost: "⚡",
	like: "❤️",
	match: "💕",
	message: "💬",
	superlike: "⭐",
	system: "🔔",
};

const TYPE_BG: Record<string, string> = {
	boost: "bg-amber-50 text-amber-600",
	like: "bg-rose-50 text-rose-600",
	match: "bg-pink-50 text-pink-600",
	message: "bg-blue-50 text-blue-600",
	superlike: "bg-yellow-50 text-yellow-600",
	system: "bg-gray-50 text-gray-500",
};

export default function NotificationsPage() {
	const {
		data: notifications,
		isLoading,
		refetch,
	} = api.notification.getAll.useQuery();

	const markRead = api.notification.markRead.useMutation({
		onSuccess: () => void refetch(),
	});
	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => {
			void refetch();
			toast.success("All notifications marked as read");
		},
	});

	const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="font-black text-3xl text-gray-900">Notifications</h1>
					<p className="mt-1 text-gray-500 text-sm">
						{unreadCount > 0 ? `${unreadCount} unread` : "All caught up! 🎉"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && (
						<Badge className="border-0 bg-rose-500 px-3 text-white">
							{unreadCount}
						</Badge>
					)}
					<Button
						className="border-rose-200 text-rose-600 hover:bg-rose-50"
						disabled={unreadCount === 0 || markAllRead.isPending}
						onClick={() => markAllRead.mutate()}
						size="sm"
						variant="outline"
					>
						<CheckCheckIcon className="mr-1.5 h-4 w-4" /> Mark all read
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton className="h-20 rounded-2xl" key={i} />
					))}
				</div>
			) : !notifications?.length ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 border-dashed py-20 text-center">
					<BellOffIcon className="mb-3 h-10 w-10 text-rose-200" />
					<p className="font-medium text-gray-500 text-sm">
						No notifications yet
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{notifications.map((n) => (
						<div
							className={`rounded-2xl border p-4 transition ${
								!n.isRead
									? "border-rose-200 bg-rose-50/60"
									: "border-rose-100 bg-white"
							}`}
							key={n.id}
						>
							<div className="flex items-start gap-3">
								<div
									className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl ${TYPE_BG[n.type] ?? "bg-gray-50 text-gray-500"}`}
								>
									{TYPE_ICONS[n.type] ?? "🔔"}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p
												className={`font-bold text-sm ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}
											>
												{n.title}
											</p>
											<p
												className={`mt-0.5 text-sm ${!n.isRead ? "text-gray-700" : "text-gray-400"}`}
											>
												{n.message}
											</p>
										</div>
										<div className="flex shrink-0 items-center gap-2">
											{!n.isRead && (
												<span className="h-2 w-2 rounded-full bg-rose-500" />
											)}
											<p className="text-[11px] text-gray-400">
												{new Date(n.createdAt).toLocaleDateString("en-IN", {
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
													month: "short",
												})}
											</p>
										</div>
									</div>
									{!n.isRead && (
										<button
											className="mt-1.5 font-medium text-[11px] text-rose-500 transition hover:text-rose-600"
											onClick={() => markRead.mutate({ id: n.id })}
											type="button"
										>
											Mark as read
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
