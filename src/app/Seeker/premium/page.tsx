"use client";

import { CheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

const PREMIUM_FEATURES = [
	{
		desc: "Like and super-like as many profiles as you want with no daily cap",
		emoji: "❤️",
		title: "Unlimited Likes",
	},
	{
		desc: "See profile pictures and names of everyone who liked you",
		emoji: "👀",
		title: "See Who Likes You",
	},
	{
		desc: "Filter by age, gender, location, and lifestyle preferences",
		emoji: "🎯",
		title: "Advanced Filters",
	},
	{
		desc: "Appear at the top of discovery for 1 hour with a single tap",
		emoji: "⚡",
		title: "Profile Boost",
	},
	{
		desc: "Find and connect with people near your current location",
		emoji: "📍",
		title: "Nearby Discovery",
	},
	{
		desc: "Send unlimited super-likes to stand out to potential matches",
		emoji: "⭐",
		title: "Unlimited Super-likes",
	},
];

export default function PremiumPage() {
	const router = useRouter();
	const { data: profile, refetch } = api.profile.getMe.useQuery();

	const upgrade = api.profile.upgradePremium.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: () => {
			void refetch();
			toast.success("Welcome to Bondly Premium! ✨");
			router.push("/Seeker/dashboard");
		},
	});

	const activateBoost = api.profile.activateBoost.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: () => {
			void refetch();
			toast.success("Profile boosted for 1 hour! ⚡");
		},
	});

	if (profile?.isPremium) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="font-black text-3xl text-gray-900">Premium</h1>
					<p className="mt-1 text-gray-500 text-sm">
						You&apos;re a Premium member
					</p>
				</div>
				<div className="rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-center text-white">
					<SparklesIcon className="mx-auto mb-3 h-12 w-12" />
					<h2 className="font-black text-2xl">You&apos;re on Premium! ✨</h2>
					<p className="mx-auto mt-2 max-w-sm text-white/80">
						Enjoy all premium features including unlimited likes, advanced
						filters, and more.
					</p>
					{!profile.isBoostActive ? (
						<Button
							className="mt-6 border-0 bg-white font-bold text-rose-600 hover:bg-white/90"
							disabled={activateBoost.isPending}
							onClick={() => activateBoost.mutate()}
						>
							<ZapIcon className="mr-2 h-4 w-4" />
							{activateBoost.isPending
								? "Boosting..."
								: "Activate Profile Boost (1 hour)"}
						</Button>
					) : (
						<Badge className="mt-4 border-0 bg-white px-4 py-1.5 text-rose-600">
							⚡ Profile Boost Active
						</Badge>
					)}
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{PREMIUM_FEATURES.map((f) => (
						<div
							className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-white p-4"
							key={f.title}
						>
							<span className="shrink-0 text-2xl">{f.emoji}</span>
							<div>
								<p className="font-bold text-gray-900 text-sm">{f.title}</p>
								<p className="mt-0.5 text-gray-500 text-xs">{f.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-black text-3xl text-gray-900">Go Premium</h1>
				<p className="mt-1 text-gray-500 text-sm">
					Unlock the full Bondly experience
				</p>
			</div>

			<div className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-center text-white md:p-16">
				<SparklesIcon className="mx-auto mb-4 h-14 w-14" />
				<h2 className="font-black text-3xl">Bondly Premium</h2>
				<p className="mx-auto mt-2 max-w-md text-white/80">
					Get more matches, see who likes you, and stand out with premium
					features designed to help you find your person.
				</p>
				<div className="mt-6 flex items-end justify-center gap-1">
					<span className="font-black text-5xl">₹499</span>
					<span className="mb-1.5 text-white/70">/month</span>
				</div>
				<Button
					className="mt-6 h-12 border-0 bg-white px-10 font-bold text-base text-rose-600 hover:bg-white/90"
					disabled={upgrade.isPending}
					onClick={() => upgrade.mutate()}
					size="lg"
				>
					{upgrade.isPending ? "Upgrading..." : "Upgrade Now →"}
				</Button>
				<p className="mt-3 text-white/50 text-xs">
					Cancel anytime. No hidden fees.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{PREMIUM_FEATURES.map((f) => (
					<div
						className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
						key={f.title}
					>
						<span className="shrink-0 text-2xl">{f.emoji}</span>
						<div>
							<div className="flex items-center gap-2">
								<p className="font-bold text-gray-900 text-sm">{f.title}</p>
								<CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
							</div>
							<p className="mt-0.5 text-gray-500 text-xs">{f.desc}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
