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
import { authClient } from "@/server/better-auth/client";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({ email: "", password: "" });

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const { data, error } = await authClient.signIn.email({
				email: form.email,
				password: form.password,
			});
			if (error) {
				toast.error(error.message ?? "Invalid credentials");
				return;
			}
			// @ts-expect-error — additionalFields
			const role = data?.user?.role as string;
			if (role === "admin") router.push("/Admin/dashboard");
			else router.push("/Seeker/dashboard");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link className="mb-5 inline-flex items-center gap-2" href="/">
						<span className="text-3xl">💕</span>
						<span className="font-black text-2xl text-rose-600">Bondly</span>
					</Link>
					<h1 className="font-black text-2xl text-gray-900">Welcome back</h1>
					<p className="mt-1 text-gray-500 text-sm">
						Sign in to find your match
					</p>
				</div>
				<Card className="border-rose-100 shadow-rose-100/50 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-gray-900 text-xl">Sign In</CardTitle>
						<CardDescription>
							Enter your credentials to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-1.5">
								<Label>Email</Label>
								<Input
									className="border-rose-100 focus-visible:ring-rose-400"
									onChange={(e) =>
										setForm((p) => ({ ...p, email: e.target.value }))
									}
									placeholder="you@example.com"
									required
									type="email"
									value={form.email}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Password</Label>
								<div className="relative">
									<Input
										className="border-rose-100 pr-10 focus-visible:ring-rose-400"
										onChange={(e) =>
											setForm((p) => ({ ...p, password: e.target.value }))
										}
										placeholder="••••••••"
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
										Signing in...
									</>
								) : (
									"Sign In"
								)}
							</Button>
						</form>
						<p className="mt-4 text-center text-muted-foreground text-sm">
							Don&apos;t have an account?{" "}
							<Link
								className="font-medium text-rose-500 transition hover:text-rose-600"
								href="/register"
							>
								Join free
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
