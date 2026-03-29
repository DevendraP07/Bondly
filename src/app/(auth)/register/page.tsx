"use client";

import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/server/better-auth/client";

export default function RegisterPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({
		dob: "",
		email: "",
		gender: "",
		name: "",
		password: "",
	});

	function set(key: string, value: string) {
		setForm((p) => ({ ...p, [key]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (form.password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		if (!/[A-Z]/.test(form.password)) {
			toast.error("Password must contain at least 1 uppercase letter");
			return;
		}
		if (!/[0-9]/.test(form.password)) {
			toast.error("Password must contain at least 1 number");
			return;
		}
		if (!/[^A-Za-z0-9]/.test(form.password)) {
			toast.error("Password must contain at least 1 special character");
			return;
		}
		if (!form.gender) {
			toast.error("Please select your gender");
			return;
		}
		setLoading(true);
		try {
			const { error } = await authClient.signUp.email({
				name: form.name,
				email: form.email,
				password: form.password,
				// @ts-expect-error — additionalFields
				role: "seeker",
				dob: form.dob,
				gender: form.gender,
			});
			if (error) {
				toast.error(error.message ?? "Registration failed");
				return;
			}
			toast.success("Account created! Please sign in.");
			router.push("/login");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 px-4 py-10">
			<div className="w-full max-w-lg">
				<div className="mb-8 text-center">
					<Link className="mb-5 inline-flex items-center gap-2" href="/">
						<span className="text-3xl">💕</span>
						<span className="font-black text-2xl text-rose-600">Bondly</span>
					</Link>
					<h1 className="font-black text-2xl text-gray-900">
						Create your profile
					</h1>
					<p className="mt-1 text-gray-500 text-sm">
						Find meaningful connections today
					</p>
				</div>
				<Card className="border-rose-100 shadow-rose-100/50 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-gray-900 text-xl">Join Bondly</CardTitle>
						<CardDescription>
							Fill in your details to get started
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Full Name *</Label>
									<Input
										className="border-rose-100 focus-visible:ring-rose-400"
										onChange={(e) => set("name", e.target.value)}
										placeholder="Alex Smith"
										required
										value={form.name}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Email *</Label>
									<Input
										className="border-rose-100 focus-visible:ring-rose-400"
										onChange={(e) => set("email", e.target.value)}
										placeholder="you@example.com"
										required
										type="email"
										value={form.email}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Date of Birth *</Label>
									<Input
										className="border-rose-100 focus-visible:ring-rose-400"
										onChange={(e) => set("dob", e.target.value)}
										required
										type="date"
										value={form.dob}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Gender *</Label>
									<Select
										onValueChange={(v) => set("gender", v)}
										required
										value={form.gender}
									>
										<SelectTrigger className="border-rose-100 focus:ring-rose-400">
											<SelectValue placeholder="Select gender" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">Male</SelectItem>
											<SelectItem value="female">Female</SelectItem>
											<SelectItem value="non_binary">Non-binary</SelectItem>
											<SelectItem value="other">Other</SelectItem>
											<SelectItem value="prefer_not_to_say">
												Prefer not to say
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-1.5">
								<Label>Password *</Label>
								<div className="relative">
									<Input
										className="border-rose-100 pr-10 focus-visible:ring-rose-400"
										onChange={(e) => set("password", e.target.value)}
										placeholder="Min 8 chars, uppercase, number, special"
										required
										type={showPassword ? "text" : "password"}
										value={form.password}
									/>
									<button
										className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
										onClick={() => setShowPassword((p) => !p)}
										type="button"
									>
										{showPassword ? (
											<EyeOffIcon className="h-4 w-4" />
										) : (
											<EyeIcon className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>
							<Button
								className="w-full border-0 bg-gradient-to-r from-rose-500 to-pink-500 font-semibold text-white hover:from-rose-600 hover:to-pink-600"
								disabled={loading}
								type="submit"
							>
								{loading ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />{" "}
										Creating account...
									</>
								) : (
									"Create Account — Free"
								)}
							</Button>
						</form>
						<p className="mt-4 text-center text-muted-foreground text-sm">
							Already have an account?{" "}
							<Link
								className="font-medium text-rose-500 transition hover:text-rose-600"
								href="/login"
							>
								Sign in
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
