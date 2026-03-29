import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
	const features = [
		{
			emoji: "💖",
			title: "Smart Matchmaking",
			desc: "Our algorithm finds compatible matches based on your interests, lifestyle, and preferences.",
		},
		{
			emoji: "🔒",
			title: "Safe & Secure",
			desc: "Verified profiles and secure messaging keep your experience private and protected.",
		},
		{
			emoji: "💬",
			title: "Real-time Chat",
			desc: "Chat instantly with your matches. Share photos, voice notes, and emojis.",
		},
		{
			emoji: "✨",
			title: "Premium Boosts",
			desc: "Get seen by more people with profile boosts and priority listing.",
		},
		{
			emoji: "📍",
			title: "Nearby Discovery",
			desc: "Find people near you with location-based discovery for real-time connections.",
		},
		{
			emoji: "⚡",
			title: "Unlimited Likes",
			desc: "Premium users enjoy unlimited likes and super-likes to maximize matches.",
		},
	];

	const steps = [
		{
			num: "01",
			title: "Create Your Profile",
			desc: "Add your photos, bio, interests, and set your match preferences in minutes.",
		},
		{
			num: "02",
			title: "Discover & Like",
			desc: "Browse profiles, like the ones you love, or super-like someone special.",
		},
		{
			num: "03",
			title: "Match & Chat",
			desc: "When both of you like each other, you match — then the conversation begins.",
		},
	];

	const stats = [
		{ label: "Matches Made", value: "50K+" },
		{ label: "Active Users", value: "200K+" },
		{ label: "Cities", value: "500+" },
		{ label: "Satisfaction", value: "96%" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 font-sans">
			{/* NAV */}
			<nav className="sticky top-0 z-50 border-rose-100/80 border-b bg-white/80 backdrop-blur-xl">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link className="flex items-center gap-2" href="/">
						<span className="text-2xl">💕</span>
						<span className="font-black text-rose-600 text-xl tracking-tight">
							Bondly
						</span>
					</Link>
					<div className="flex items-center gap-2.5">
						<Button
							asChild
							className="text-rose-600 hover:bg-rose-50"
							size="sm"
							variant="ghost"
						>
							<Link href="/login">Sign In</Link>
						</Button>
						<Button
							asChild
							className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-200 shadow-sm hover:from-rose-600 hover:to-pink-600"
							size="sm"
						>
							<Link href="/register">Join Free</Link>
						</Button>
					</div>
				</div>
			</nav>

			{/* HERO */}
			<section className="relative overflow-hidden px-6 py-24 text-center md:py-36">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-rose-300/20 blur-[80px]" />
					<div className="absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-pink-300/20 blur-[80px]" />
				</div>
				<div className="relative mx-auto max-w-4xl">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 font-semibold text-rose-600 text-xs">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
						50,000+ happy connections made
					</div>
					<h1 className="mb-6 font-black text-5xl text-gray-900 leading-[1.05] tracking-tight md:text-7xl">
						Find your{" "}
						<span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
							perfect match
						</span>
					</h1>
					<p className="mx-auto mb-10 max-w-xl text-gray-500 text-lg leading-relaxed">
						Bondly connects you with people who truly get you — based on your
						personality, interests, and what you&apos;re looking for in life.
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						<Button
							asChild
							className="h-12 border-0 bg-gradient-to-r from-rose-500 to-pink-500 px-8 font-bold text-base text-white shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-pink-600"
							size="lg"
						>
							<Link href="/register">Start Matching — It&apos;s Free →</Link>
						</Button>
						<Button
							asChild
							className="h-12 border-rose-200 px-8 text-base text-rose-600 hover:bg-rose-50"
							size="lg"
							variant="outline"
						>
							<Link href="/login">Sign In</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* STATS */}
			<div className="border-rose-100 border-y bg-white">
				<div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
					{stats.map((s) => (
						<div className="text-center" key={s.label}>
							<p className="font-black text-3xl text-rose-500">{s.value}</p>
							<p className="mt-1 text-gray-500 text-sm">{s.label}</p>
						</div>
					))}
				</div>
			</div>

			{/* HOW IT WORKS */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-6xl">
					<div className="mb-14 text-center">
						<p className="mb-3 font-bold text-rose-500 text-xs uppercase tracking-[0.2em]">
							Simple Process
						</p>
						<h2 className="font-black text-4xl text-gray-900">
							Love is 3 steps away
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						{steps.map((s) => (
							<div
								className="relative rounded-3xl border border-rose-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
								key={s.num}
							>
								<p className="absolute top-6 right-6 font-black text-5xl text-rose-100">
									{s.num}
								</p>
								<h3 className="mb-3 font-bold text-gray-900 text-lg">
									{s.title}
								</h3>
								<p className="text-gray-500 text-sm leading-relaxed">
									{s.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FEATURES */}
			<section className="bg-white px-6 py-20">
				<div className="mx-auto max-w-6xl">
					<div className="mb-14 text-center">
						<p className="mb-3 font-bold text-rose-500 text-xs uppercase tracking-[0.2em]">
							Everything you need
						</p>
						<h2 className="font-black text-4xl text-gray-900">
							Built for real connections
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((f) => (
							<div
								className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-rose-50/30 p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100"
								key={f.title}
							>
								<div className="mb-4 text-3xl">{f.emoji}</div>
								<h3 className="mb-2 font-bold text-gray-900">{f.title}</h3>
								<p className="text-gray-500 text-sm leading-relaxed">
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* PREMIUM */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-10 text-white md:p-16">
					<div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
						<div>
							<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 font-semibold text-xs">
								✨ Bondly Premium
							</div>
							<h2 className="mb-5 font-black text-4xl">
								Unlock your full potential
							</h2>
							<p className="mb-8 text-white/80 leading-relaxed">
								Go premium and get unlimited likes, advanced filters, profile
								boosts, and see exactly who liked you.
							</p>
							<ul className="space-y-2.5">
								{[
									"Unlimited likes & super-likes",
									"See who liked your profile",
									"Advanced search filters",
									"Profile boost & priority listing",
									"Location-based nearby discovery",
									"Ad-free experience",
								].map((item) => (
									<li className="flex items-center gap-2.5 text-sm" key={item}>
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px]">
											✓
										</span>
										{item}
									</li>
								))}
							</ul>
							<Button
								asChild
								className="mt-8 border-0 bg-white font-bold text-rose-600 hover:bg-white/90"
								size="lg"
							>
								<Link href="/register">Get Premium →</Link>
							</Button>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ icon: "💕", label: "Matches Made", value: "50K+" },
								{ icon: "👤", label: "Active Users", value: "200K+" },
								{ icon: "📍", label: "Cities", value: "500+" },
								{ icon: "⭐", label: "Satisfaction", value: "96%" },
							].map((s) => (
								<div
									className="rounded-2xl bg-white/10 p-5 text-center"
									key={s.label}
								>
									<div className="mb-1 text-2xl">{s.icon}</div>
									<p className="font-black text-2xl">{s.value}</p>
									<p className="mt-0.5 text-white/70 text-xs">{s.label}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-rose-100 border-t bg-white px-6 py-24 text-center">
				<div className="mx-auto max-w-2xl">
					<h2 className="mb-5 font-black text-5xl text-gray-900">
						Your story starts here
					</h2>
					<p className="mb-10 text-gray-500 text-lg">
						Join millions of singles finding meaningful connections on Bondly
						every day.
					</p>
					<Button
						asChild
						className="h-12 border-0 bg-gradient-to-r from-rose-500 to-pink-500 px-12 font-bold text-base text-white shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-pink-600"
						size="lg"
					>
						<Link href="/register">Create Your Profile — Free</Link>
					</Button>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="border-gray-100 border-t bg-gray-50 px-6 py-10">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
					<div className="flex items-center gap-2">
						<span className="text-xl">💕</span>
						<span className="font-black text-rose-600">Bondly</span>
					</div>
					<div className="flex gap-6">
						{["Privacy", "Terms", "Safety", "Contact"].map((l) => (
							<a
								className="text-gray-400 text-sm transition hover:text-gray-700"
								href="/"
								key={l}
							>
								{l}
							</a>
						))}
					</div>
					<p className="text-gray-400 text-sm">
						&copy; 2025 Bondly. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
