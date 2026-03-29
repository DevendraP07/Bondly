"use client";

import { CheckIcon, HeartIcon, MessageCircleIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";

function calcAge(dob: string | null | undefined) {
	if (!dob) return null;
	return Math.floor(
		(Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
	);
}

function UserCard({
	name,
	photos,
}: {
	name: string;
	photos: string | null | undefined;
}) {
	const arr: string[] = photos ? (JSON.parse(photos) as string[]) : [];
	const firstPhoto = arr[0];
	if (firstPhoto) {
		return (
			<Image
				alt={name}
				className="h-16 w-16 rounded-2xl object-cover"
				height={64}
				src={firstPhoto}
				unoptimized
				width={64}
			/>
		);
	}
	return (
		<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 font-bold text-rose-500">
			{name.charAt(0).toUpperCase()}
		</div>
	);
}

const STATUS_STYLES: Record<string, string> = {
	accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
	pending: "border-amber-200 bg-amber-50 text-amber-700",
	rejected: "border-gray-200 bg-gray-50 text-gray-500",
	unmatched: "border-red-100 bg-red-50 text-red-500",
};

export default function MatchesPage() {
	const {
		data: matches,
		isLoading: mLoading,
		refetch: refetchMatches,
	} = api.match.getMyMatches.useQuery();
	const {
		data: pending,
		isLoading: pLoading,
		refetch: refetchPending,
	} = api.match.getPendingReceived.useQuery();
	const { data: history, isLoading: hLoading } =
		api.match.getHistory.useQuery();

	const respond = api.match.respond.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: (_, vars) => {
			void refetchMatches();
			void refetchPending();
			toast.success(vars.accept ? "Match accepted! 💕" : "Request declined.");
		},
	});

	const unmatch = api.match.unmatch.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: () => {
			void refetchMatches();
			toast.success("Unmatched successfully.");
		},
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-black text-3xl text-gray-900">Matches</h1>
				<p className="mt-1 text-gray-500 text-sm">
					Your connections and match requests
				</p>
			</div>

			<Tabs defaultValue="matches">
				<TabsList className="border border-rose-100 bg-rose-50/50">
					<TabsTrigger
						className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
						value="matches"
					>
						Matches
						{(matches?.length ?? 0) > 0 && (
							<Badge className="ml-1.5 border-0 bg-rose-500 px-1.5 text-[10px] text-white">
								{matches?.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger
						className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
						value="requests"
					>
						Requests
						{(pending?.length ?? 0) > 0 && (
							<Badge className="ml-1.5 border-0 bg-amber-500 px-1.5 text-[10px] text-white">
								{pending?.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger
						className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
						value="history"
					>
						History
					</TabsTrigger>
				</TabsList>

				{/* MATCHES TAB */}
				<TabsContent className="mt-5" value="matches">
					{mLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton className="h-28 rounded-2xl" key={i} />
							))}
						</div>
					) : !matches?.length ? (
						<div className="rounded-2xl border border-rose-200 border-dashed py-16 text-center">
							<HeartIcon className="mx-auto mb-3 h-10 w-10 text-rose-200" />
							<p className="font-medium text-gray-500 text-sm">
								No matches yet
							</p>
							<Link href="/Seeker/discover">
								<Button
									className="mt-4 border-rose-200 text-rose-600 hover:bg-rose-50"
									size="sm"
									variant="outline"
								>
									Start Discovering
								</Button>
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{matches.map((m) => (
								<div
									className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4"
									key={m.id}
								>
									<div className="flex items-center gap-3">
										<UserCard
											name={m.otherUser.name}
											photos={m.otherUser.photos}
										/>
										<div>
											<p className="font-bold text-gray-900">
												{m.otherUser.name}
											</p>
											{m.otherUser.bio && (
												<p className="mt-0.5 line-clamp-1 text-gray-500 text-xs">
													{m.otherUser.bio}
												</p>
											)}
											<p className="mt-1 text-[11px] text-gray-400">
												Matched{" "}
												{new Date(m.updatedAt).toLocaleDateString("en-IN", {
													day: "numeric",
													month: "short",
												})}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Link href={`/Seeker/messages/${m.id}`}>
											<Button
												className="h-8 w-8 rounded-xl border-rose-200 p-0 text-rose-500 hover:bg-rose-50"
												size="sm"
												variant="outline"
											>
												<MessageCircleIcon className="h-4 w-4" />
											</Button>
										</Link>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													className="h-8 w-8 rounded-xl border-gray-200 p-0 text-gray-400 hover:bg-gray-50"
													size="sm"
													variant="outline"
												>
													<XIcon className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Unmatch {m.otherUser.name}?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This will remove the connection from both sides and
														cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														className="border-0 bg-rose-500 text-white hover:bg-rose-600"
														onClick={() => unmatch.mutate({ matchId: m.id })}
													>
														Unmatch
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							))}
						</div>
					)}
				</TabsContent>

				{/* REQUESTS TAB */}
				<TabsContent className="mt-5 space-y-3" value="requests">
					{pLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton className="h-24 rounded-2xl" key={i} />
							))}
						</div>
					) : !pending?.length ? (
						<div className="rounded-2xl border border-rose-200 border-dashed py-16 text-center">
							<p className="text-gray-500 text-sm">No pending requests</p>
						</div>
					) : (
						pending.map((req) => (
							<div
								className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4"
								key={req.id}
							>
								<div className="flex items-center gap-3">
									<UserCard name={req.sender.name} photos={req.sender.photos} />
									<div>
										<div className="flex items-center gap-2">
											<p className="font-bold text-gray-900">
												{req.sender.name}
											</p>
											{req.sender.dob && (
												<span className="text-gray-500 text-xs">
													{calcAge(req.sender.dob)}
												</span>
											)}
										</div>
										{req.sender.bio && (
											<p className="mt-0.5 line-clamp-1 text-gray-500 text-xs">
												{req.sender.bio}
											</p>
										)}
										<p className="mt-1 text-[11px] text-amber-600 capitalize">
											{req.senderAction === "superlike"
												? "⭐ Super liked you"
												: "❤️ Liked you"}
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										className="h-8 border-rose-200 bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
										disabled={respond.isPending}
										onClick={() =>
											respond.mutate({ accept: true, matchId: req.id })
										}
										size="sm"
										variant="outline"
									>
										<CheckIcon className="mr-1 h-3.5 w-3.5" /> Accept
									</Button>
									<Button
										className="h-8 border-gray-200 text-gray-500 text-xs hover:bg-gray-50"
										disabled={respond.isPending}
										onClick={() =>
											respond.mutate({ accept: false, matchId: req.id })
										}
										size="sm"
										variant="outline"
									>
										<XIcon className="mr-1 h-3.5 w-3.5" /> Decline
									</Button>
								</div>
							</div>
						))
					)}
				</TabsContent>

				{/* HISTORY TAB */}
				<TabsContent className="mt-5 space-y-3" value="history">
					{hLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton className="h-20 rounded-2xl" key={i} />
							))}
						</div>
					) : !history?.length ? (
						<div className="rounded-2xl border border-rose-200 border-dashed py-16 text-center">
							<p className="text-gray-500 text-sm">No match history yet</p>
						</div>
					) : (
						history.map((m) => (
							<div
								className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4"
								key={m.id}
							>
								<div className="flex items-center gap-3">
									<UserCard
										name={m.otherUser.name}
										photos={m.otherUser.photos}
									/>
									<div>
										<p className="font-semibold text-gray-900">
											{m.otherUser.name}
										</p>
										<p className="mt-0.5 text-[11px] text-gray-400">
											{new Date(m.createdAt).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</p>
									</div>
								</div>
								<Badge
									className={`border text-[10px] capitalize ${STATUS_STYLES[m.status] ?? ""}`}
								>
									{m.status}
								</Badge>
							</div>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
