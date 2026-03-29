"use client";

import { HeartIcon, MessageCircleIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function SeekerDashboard() {
	const { data: profile, isLoading: pLoading } = api.profile.getMe.useQuery();
	const { data: matches, isLoading: mLoading } =
		api.match.getMyMatches.useQuery();
	const { data: pending } = api.match.getPendingReceived.useQuery();
	const { data: unreadMsgs } = api.message.getUnreadCount.useQuery();
	const { data: unreadNotifs } = api.notification.getUnreadCount.useQuery();

	const photos: string[] = profile?.photos
		? (JSON.parse(profile.photos) as string[])
		: [];
	const interests: string[] = profile?.interests
		? (JSON.parse(profile.interests) as string[])
		: [];

	const completenessFields = [
		profile?.bio,
		profile?.dob,
		profile?.gender,
		photos.length > 0,
		interests.length > 0,
		profile?.preferences,
	];
	const filled = completenessFields.filter(Boolean).length;
	const completeness = Math.round((filled / completenessFields.length) * 100);

	const stats = [
		{
			color: "text-rose-500",
			href: "/Seeker/matches",
			icon: HeartIcon,
			label: "Matches",
			loading: mLoading,
			value: matches?.length ?? 0,
		},
		{
			color: "text-amber-500",
			href: "/Seeker/matches",
			icon: HeartIcon,
			label: "Pending",
			loading: false,
			value: pending?.length ?? 0,
		},
		{
			color: "text-blue-500",
			href: "/Seeker/messages",
			icon: MessageCircleIcon,
			label: "Unread Msgs",
			loading: false,
			value: unreadMsgs?.count ?? 0,
		},
		{
			color: "text-purple-500",
			href: "/Seeker/notifications",
			icon: SparklesIcon,
			label: "Notifications",
			loading: false,
			value: unreadNotifs?.count ?? 0,
		},
	];

	return (
		<div className="space-y-8">
			{/* HEADER */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="font-black text-3xl text-gray-900">
						Hey {profile?.name?.split(" ")[0] ?? "there"} 👋
					</h1>
					<p className="mt-1 text-gray-500 text-sm">
						Here&apos;s what&apos;s happening today
					</p>
				</div>
				{profile?.isPremium && (
					<Badge className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-white">
						✨ Premium
					</Badge>
				)}
			</div>

			{/* PROFILE COMPLETENESS */}
			{completeness < 100 && (
				<div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-5">
					<div className="mb-3 flex items-center justify-between">
						<div>
							<p className="font-bold text-gray-900 text-sm">
								Complete your profile
							</p>
							<p className="mt-0.5 text-gray-500 text-xs">
								Better profiles get more matches
							</p>
						</div>
						<span className="font-black text-2xl text-rose-500">
							{completeness}%
						</span>
					</div>
					<div className="h-2.5 w-full overflow-hidden rounded-full bg-rose-100">
						<div
							className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all"
							style={{ width: `${completeness}%` }}
						/>
					</div>
					<Button
						asChild
						className="mt-4 border-rose-200 text-rose-600 hover:bg-rose-50"
						size="sm"
						variant="outline"
					>
						<Link href="/Seeker/profile">Complete Profile →</Link>
					</Button>
				</div>
			)}

			{/* STATS */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{stats.map((s) => (
					<Link href={s.href} key={s.label}>
						<Card className="cursor-pointer border-rose-100 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-rose-100/50">
							<CardContent className="p-5">
								<s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
								{s.loading ? (
									<Skeleton className="mt-1 h-8 w-12" />
								) : (
									<p className="font-black text-3xl text-gray-900">{s.value}</p>
								)}
								<p className="mt-1 text-gray-500 text-xs">{s.label}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{/* QUICK ACTIONS */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{[
					{
						desc: "Find compatible matches",
						emoji: "🔍",
						href: "/Seeker/discover",
						label: "Discover People",
					},
					{
						desc: "View your connections",
						emoji: "💕",
						href: "/Seeker/matches",
						label: "My Matches",
					},
					{
						desc: "Chat with connections",
						emoji: "💬",
						href: "/Seeker/messages",
						label: "Messages",
					},
				].map((a) => (
					<Link href={a.href} key={a.label}>
						<div className="cursor-pointer rounded-2xl border border-rose-100 bg-white p-5 transition-all hover:border-rose-200 hover:shadow-sm">
							<div className="mb-3 text-3xl">{a.emoji}</div>
							<p className="font-bold text-gray-900 text-sm">{a.label}</p>
							<p className="mt-1 text-gray-500 text-xs">{a.desc}</p>
						</div>
					</Link>
				))}
			</div>

			{/* PENDING REQUESTS */}
			{(pending?.length ?? 0) > 0 && (
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-bold text-gray-900 text-lg">
							Pending Requests
						</h2>
						<Link
							className="text-rose-500 text-xs transition hover:text-rose-600"
							href="/Seeker/matches"
						>
							View all →
						</Link>
					</div>
					<div className="space-y-3">
						{pending?.slice(0, 3).map((req) => {
							const senderPhotos: string[] = req.sender.photos
								? (JSON.parse(req.sender.photos) as string[])
								: [];
							const firstPhoto = senderPhotos[0];
							return (
								<div
									className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4"
									key={req.id}
								>
									<div className="flex items-center gap-3">
										{firstPhoto ? (
											<Image
												alt={req.sender.name}
												className="h-12 w-12 rounded-full object-cover"
												height={48}
												src={firstPhoto}
												unoptimized
												width={48}
											/>
										) : (
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 font-bold text-rose-600">
												{req.sender.name.charAt(0).toUpperCase()}
											</div>
										)}
										<div>
											<p className="font-semibold text-gray-900">
												{req.sender.name}
											</p>
											<p className="text-gray-500 text-xs capitalize">
												{req.senderAction === "superlike"
													? "⭐ Super liked you"
													: "❤️ Liked you"}
											</p>
										</div>
									</div>
									<Link href="/Seeker/matches">
										<Button
											className="h-8 border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs"
											size="sm"
										>
											View
										</Button>
									</Link>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* PREMIUM UPSELL */}
			{!profile?.isPremium && (
				<div className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="font-black text-lg">Upgrade to Premium ✨</p>
							<p className="mt-1 text-sm text-white/80">
								Unlimited likes, see who liked you, profile boost &amp; more
							</p>
						</div>
						<Link href="/Seeker/premium">
							<Button
								className="border-0 bg-white font-bold text-rose-600 hover:bg-white/90"
								size="sm"
							>
								Upgrade Now
							</Button>
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
