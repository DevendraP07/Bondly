"use client";

import { HeartIcon, StarIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function DiscoverPage() {
	const [filters, setFilters] = useState({
		gender: "",
		maxAge: "",
		minAge: "",
	});
	const [applied, setApplied] = useState<{
		gender?: string;
		maxAge?: number;
		minAge?: number;
	}>({});
	const [current, setCurrent] = useState(0);

	const { data: profile } = api.profile.getMe.useQuery();
	const {
		data: profiles,
		isLoading,
		refetch,
	} = api.match.discover.useQuery(applied);

	const sendAction = api.match.sendAction.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: (data) => {
			if (data.matched) toast.success("It's a match! 💕");
			setCurrent((p) => p + 1);
			void refetch();
		},
	});

	const isPremium = profile?.isPremium ?? false;
	const currentProfile = profiles?.[current];
	const photos: string[] = currentProfile?.photos
		? (JSON.parse(currentProfile.photos) as string[])
		: [];
	const interests: string[] = currentProfile?.interests
		? (JSON.parse(currentProfile.interests) as string[])
		: [];
	const firstPhoto = photos[0];

	function applyFilters() {
		if (!isPremium && (filters.gender || filters.minAge || filters.maxAge)) {
			toast.error("Advanced filters require Premium");
			return;
		}
		setApplied({
			gender: filters.gender || undefined,
			maxAge: filters.maxAge ? Number(filters.maxAge) : undefined,
			minAge: filters.minAge ? Number(filters.minAge) : undefined,
		});
		setCurrent(0);
	}

	function act(action: "dislike" | "like" | "superlike") {
		if (!currentProfile) return;
		sendAction.mutate({ action, targetId: currentProfile.id });
	}

	function calcAge(dob: string | null | undefined) {
		if (!dob) return null;
		return Math.floor(
			(Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="font-black text-3xl text-gray-900">Discover</h1>
					<p className="mt-1 text-gray-500 text-sm">Find your perfect match</p>
				</div>
				{isPremium && (
					<Badge className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
						✨ Premium Filters Active
					</Badge>
				)}
			</div>

			{/* FILTERS */}
			<div className="rounded-2xl border border-rose-100 bg-white p-5">
				<div className="flex flex-wrap items-end gap-3">
					<div className="space-y-1.5">
						<Label className="text-gray-500 text-xs">
							Gender
							{!isPremium && (
								<span className="ml-1 text-rose-400">(Premium)</span>
							)}
						</Label>
						<Select
							disabled={!isPremium}
							onValueChange={(v) => setFilters((p) => ({ ...p, gender: v }))}
							value={filters.gender}
						>
							<SelectTrigger className="h-9 w-36 border-rose-100">
								<SelectValue placeholder="Any" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
								<SelectItem value="non_binary">Non-binary</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label className="text-gray-500 text-xs">
							Min Age
							{!isPremium && (
								<span className="ml-1 text-rose-400">(Premium)</span>
							)}
						</Label>
						<Input
							className="h-9 w-24 border-rose-100"
							disabled={!isPremium}
							onChange={(e) =>
								setFilters((p) => ({ ...p, minAge: e.target.value }))
							}
							placeholder="18"
							type="number"
							value={filters.minAge}
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-gray-500 text-xs">
							Max Age
							{!isPremium && (
								<span className="ml-1 text-rose-400">(Premium)</span>
							)}
						</Label>
						<Input
							className="h-9 w-24 border-rose-100"
							disabled={!isPremium}
							onChange={(e) =>
								setFilters((p) => ({ ...p, maxAge: e.target.value }))
							}
							placeholder="60"
							type="number"
							value={filters.maxAge}
						/>
					</div>
					<Button
						className="h-9 border-rose-200 text-rose-600 hover:bg-rose-50"
						onClick={applyFilters}
						size="sm"
						variant="outline"
					>
						Apply Filters
					</Button>
				</div>
			</div>

			{/* PROFILE CARD */}
			{isLoading ? (
				<Skeleton className="h-[480px] w-full rounded-3xl" />
			) : !currentProfile ? (
				<div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 border-dashed bg-white py-24 text-center">
					<p className="mb-4 text-5xl">💕</p>
					<p className="font-bold text-gray-900 text-lg">No more profiles</p>
					<p className="mt-1 text-gray-500 text-sm">
						Check back later for new people
					</p>
				</div>
			) : (
				<div className="mx-auto max-w-sm">
					<div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-lg shadow-rose-100/50">
						{/* PHOTO */}
						<div className="relative h-[420px] bg-gradient-to-br from-rose-100 to-pink-100">
							{firstPhoto ? (
								<Image
									alt={currentProfile.name}
									className="h-full w-full object-cover"
									fill
									src={firstPhoto}
									unoptimized
								/>
							) : (
								<div className="flex h-full items-center justify-center text-8xl">
									{currentProfile.gender === "female"
										? "👩"
										: currentProfile.gender === "male"
											? "👨"
											: "🧑"}
								</div>
							)}
							{currentProfile.isBoostActive && (
								<div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 font-bold text-[10px] text-white">
									⚡ Boosted
								</div>
							)}
							{/* GRADIENT OVERLAY */}
							<div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
							<div className="absolute bottom-4 left-4 text-white">
								<p className="font-black text-2xl">
									{currentProfile.name}
									{currentProfile.dob && (
										<span className="ml-2 font-normal text-lg">
											{calcAge(currentProfile.dob)}
										</span>
									)}
								</p>
								{currentProfile.bio && (
									<p className="mt-0.5 line-clamp-2 text-sm text-white/80">
										{currentProfile.bio}
									</p>
								)}
							</div>
						</div>

						{/* INTERESTS */}
						{interests.length > 0 && (
							<div className="flex flex-wrap gap-1.5 px-4 py-3">
								{interests.slice(0, 5).map((interest) => (
									<Badge
										className="border-rose-200 bg-rose-50 text-rose-600 text-xs"
										key={interest}
										variant="outline"
									>
										{interest}
									</Badge>
								))}
							</div>
						)}

						{/* ACTION BUTTONS */}
						<div className="flex items-center justify-center gap-5 border-rose-50 border-t px-4 py-4">
							<button
								className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:opacity-50"
								disabled={sendAction.isPending}
								onClick={() => act("dislike")}
								type="button"
							>
								<XIcon className="h-6 w-6" />
							</button>
							<button
								className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 transition hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
								disabled={sendAction.isPending}
								onClick={() => act("like")}
								type="button"
							>
								<HeartIcon className="h-7 w-7 fill-current" />
							</button>
							<button
								className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-amber-500 transition hover:bg-amber-100 disabled:opacity-50"
								disabled={sendAction.isPending}
								onClick={() => act("superlike")}
								type="button"
							>
								<StarIcon className="h-6 w-6 fill-current" />
							</button>
						</div>
					</div>
					<p className="mt-4 text-center text-gray-400 text-xs">
						{current + 1} of {profiles?.length ?? 0} profiles
					</p>
				</div>
			)}
		</div>
	);
}
