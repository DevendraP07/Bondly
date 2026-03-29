"use client";

import {
	PencilIcon,
	PlusIcon,
	SaveIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";

const INTEREST_OPTIONS = [
	"Reading",
	"Travel",
	"Music",
	"Cooking",
	"Sports",
	"Movies",
	"Art",
	"Gaming",
	"Yoga",
	"Photography",
	"Dancing",
	"Hiking",
	"Coffee",
	"Tech",
];

type ProfileForm = {
	bio: string;
	dob: string;
	gender: string;
	interests: string[];
	lifestyle: Record<string, string>;
	name: string;
	photos: string[];
	preferences: { genderPref: string; maxAge: string; minAge: string };
};

const EMPTY_FORM: ProfileForm = {
	bio: "",
	dob: "",
	gender: "",
	interests: [],
	lifestyle: {},
	name: "",
	photos: [],
	preferences: { genderPref: "", maxAge: "", minAge: "" },
};

export default function ProfilePage() {
	const router = useRouter();
	const [editing, setEditing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);

	const { data: profile, isLoading, refetch } = api.profile.getMe.useQuery();
	const { data: viewers } = api.match.getMyViewers.useQuery();

	useEffect(() => {
		if (profile) {
			setForm({
				bio: profile.bio ?? "",
				dob: profile.dob ?? "",
				gender: profile.gender ?? "",
				interests: profile.interests
					? (JSON.parse(profile.interests) as string[])
					: [],
				lifestyle: profile.lifestyle
					? (JSON.parse(profile.lifestyle) as Record<string, string>)
					: {},
				name: profile.name ?? "",
				photos: profile.photos ? (JSON.parse(profile.photos) as string[]) : [],
				preferences: profile.preferences
					? (JSON.parse(profile.preferences) as {
							genderPref: string;
							maxAge: string;
							minAge: string;
						})
					: { genderPref: "", maxAge: "", minAge: "" },
			});
		}
	}, [profile]);

	const update = api.profile.update.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: () => {
			setEditing(false);
			void refetch();
			toast.success("Profile updated!");
		},
	});

	const deleteAccount = api.profile.deleteAccount.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: async () => {
			await authClient.signOut();
			router.push("/");
		},
	});

	const activateBoost = api.profile.activateBoost.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: () => {
			void refetch();
			toast.success("Profile boosted for 1 hour! ⚡");
		},
	});

	function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Photo must be under 5MB");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setForm((p) => ({
				...p,
				photos: [...p.photos, reader.result as string],
			}));
		};
		reader.readAsDataURL(file);
	}

	function removePhoto(idx: number) {
		setForm((p) => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }));
	}

	function toggleInterest(interest: string) {
		setForm((p) => ({
			...p,
			interests: p.interests.includes(interest)
				? p.interests.filter((item) => item !== interest)
				: [...p.interests, interest],
		}));
	}

	function saveProfile() {
		update.mutate({
			bio: form.bio || undefined,
			dob: form.dob || undefined,
			gender:
				(form.gender as
					| "female"
					| "male"
					| "non_binary"
					| "other"
					| "prefer_not_to_say"
					| undefined) || undefined,
			interests: JSON.stringify(form.interests),
			lifestyle: JSON.stringify(form.lifestyle),
			name: form.name || undefined,
			photos: JSON.stringify(form.photos),
			preferences: JSON.stringify(form.preferences),
		});
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-48 w-full rounded-2xl" />
				<Skeleton className="h-64 w-full rounded-2xl" />
			</div>
		);
	}

	const initials = (profile?.name ?? "?")
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{/* HEADER CARD */}
			<Card className="overflow-hidden border-rose-100">
				<div className="h-24 bg-gradient-to-r from-rose-400 to-pink-500" />
				<CardContent className="px-6 pt-0 pb-5">
					<div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
						<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-rose-100 font-black text-2xl text-rose-500 shadow-sm">
							{form.photos[0] ? (
								<img
									alt="profile"
									className="h-full w-full object-cover"
									src={form.photos[0]}
								/>
							) : (
								initials
							)}
						</div>
						<div className="flex gap-2 pb-1">
							{profile?.isPremium && !profile.isBoostActive && (
								<Button
									className="h-8 border-amber-200 text-amber-600 text-xs hover:bg-amber-50"
									disabled={activateBoost.isPending}
									onClick={() => activateBoost.mutate()}
									size="sm"
									variant="outline"
								>
									⚡ Boost Profile
								</Button>
							)}
							{profile?.isBoostActive && (
								<Badge className="border-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white">
									⚡ Boosted
								</Badge>
							)}
							{editing ? (
								<div className="flex gap-2">
									<Button
										className="h-8 border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs"
										disabled={update.isPending}
										onClick={saveProfile}
										size="sm"
									>
										<SaveIcon className="mr-1.5 h-3.5 w-3.5" />
										{update.isPending ? "Saving..." : "Save"}
									</Button>
									<Button
										className="h-8 border-gray-200 text-gray-500 text-xs"
										onClick={() => setEditing(false)}
										size="sm"
										variant="outline"
									>
										<XIcon className="h-3.5 w-3.5" />
									</Button>
								</div>
							) : (
								<Button
									className="h-8 border-rose-200 text-rose-600 text-xs hover:bg-rose-50"
									onClick={() => setEditing(true)}
									size="sm"
									variant="outline"
								>
									<PencilIcon className="mr-1.5 h-3.5 w-3.5" /> Edit
								</Button>
							)}
						</div>
					</div>
					<div className="mt-3">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="font-black text-gray-900 text-xl">
								{profile?.name}
							</h1>
							{profile?.isPremium && (
								<Badge className="border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] text-white">
									✨ Premium
								</Badge>
							)}
						</div>
						<p className="mt-0.5 text-gray-500 text-sm">{profile?.email}</p>
						{profile?.bio && !editing && (
							<p className="mt-2 text-gray-600 text-sm">{profile.bio}</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* EDIT FORM */}
			{editing && (
				<Card className="border-rose-100">
					<CardHeader className="pb-2">
						<CardTitle className="text-base text-gray-900">
							Edit Profile
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						{/* PHOTOS */}
						<div className="space-y-2">
							<Label>Photos (max 5MB each)</Label>
							<div className="flex flex-wrap gap-2">
								{form.photos.map((photo, idx) => (
									<div className="relative" key={`photo-${idx}`}>
										<img
											alt={`Photo ${idx + 1}`}
											className="h-20 w-20 rounded-xl object-cover"
											src={photo}
										/>
										<button
											className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
											onClick={() => removePhoto(idx)}
											type="button"
										>
											<XIcon className="h-3 w-3" />
										</button>
									</div>
								))}
								{form.photos.length < 6 && (
									<button
										className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-rose-200 border-dashed text-rose-400 transition hover:border-rose-400"
										onClick={() => fileInputRef.current?.click()}
										type="button"
									>
										<PlusIcon className="h-6 w-6" />
									</button>
								)}
							</div>
							<input
								accept="image/jpg,image/jpeg,image/png,image/webp"
								className="hidden"
								onChange={handlePhotoUpload}
								ref={fileInputRef}
								type="file"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Name</Label>
								<Input
									className="border-rose-100"
									onChange={(e) =>
										setForm((p) => ({ ...p, name: e.target.value }))
									}
									value={form.name}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Date of Birth</Label>
								<Input
									className="border-rose-100"
									onChange={(e) =>
										setForm((p) => ({ ...p, dob: e.target.value }))
									}
									type="date"
									value={form.dob}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label>Gender</Label>
							<Select
								onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
								value={form.gender}
							>
								<SelectTrigger className="border-rose-100">
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

						<div className="space-y-1.5">
							<Label>Bio (max 500 characters)</Label>
							<Textarea
								className="resize-none border-rose-100"
								maxLength={500}
								onChange={(e) =>
									setForm((p) => ({ ...p, bio: e.target.value }))
								}
								placeholder="Tell people about yourself..."
								rows={3}
								value={form.bio}
							/>
							<p className="text-gray-400 text-xs">{form.bio.length}/500</p>
						</div>

						{/* INTERESTS */}
						<div className="space-y-2">
							<Label>Interests</Label>
							<div className="flex flex-wrap gap-2">
								{INTEREST_OPTIONS.map((interest) => (
									<button
										className={`rounded-full border px-3 py-1 font-medium text-xs transition ${
											form.interests.includes(interest)
												? "border-rose-500 bg-rose-50 text-rose-600"
												: "border-gray-200 text-gray-600 hover:border-rose-300"
										}`}
										key={interest}
										onClick={() => toggleInterest(interest)}
										type="button"
									>
										{interest}
									</button>
								))}
							</div>
						</div>

						{/* PREFERENCES */}
						<div className="space-y-2">
							<Label>Match Preferences</Label>
							<div className="grid grid-cols-3 gap-2">
								<div className="space-y-1.5">
									<Label className="text-xs">Gender Pref</Label>
									<Select
										onValueChange={(v) =>
											setForm((p) => ({
												...p,
												preferences: { ...p.preferences, genderPref: v },
											}))
										}
										value={form.preferences.genderPref}
									>
										<SelectTrigger className="h-9 border-rose-100 text-xs">
											<SelectValue placeholder="Any" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">Male</SelectItem>
											<SelectItem value="female">Female</SelectItem>
											<SelectItem value="any">Any</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Min Age</Label>
									<Input
										className="h-9 border-rose-100"
										onChange={(e) =>
											setForm((p) => ({
												...p,
												preferences: {
													...p.preferences,
													minAge: e.target.value,
												},
											}))
										}
										placeholder="18"
										type="number"
										value={form.preferences.minAge}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Max Age</Label>
									<Input
										className="h-9 border-rose-100"
										onChange={(e) =>
											setForm((p) => ({
												...p,
												preferences: {
													...p.preferences,
													maxAge: e.target.value,
												},
											}))
										}
										placeholder="60"
										type="number"
										value={form.preferences.maxAge}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* WHO VIEWED ME — Premium only */}
			{profile?.isPremium && (
				<Card className="border-rose-100">
					<CardHeader className="pb-2">
						<CardTitle className="text-base text-gray-900">
							Who viewed your profile 👀
						</CardTitle>
					</CardHeader>
					<CardContent>
						{!viewers?.length ? (
							<p className="text-gray-400 text-sm">No profile views yet</p>
						) : (
							<div className="space-y-3">
								{viewers.slice(0, 5).map((v) => {
									const arr: string[] = v.viewer.photos
										? (JSON.parse(v.viewer.photos) as string[])
										: [];
									return (
										<div className="flex items-center gap-3" key={v.id}>
											{arr[0] ? (
												<img
													alt={v.viewer.name}
													className="h-10 w-10 rounded-xl object-cover"
													src={arr[0]}
												/>
											) : (
												<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-500 text-sm">
													{v.viewer.name.charAt(0).toUpperCase()}
												</div>
											)}
											<div>
												<p className="font-semibold text-gray-900 text-sm">
													{v.viewer.name}
												</p>
												<p className="text-gray-400 text-xs">
													{new Date(v.createdAt).toLocaleDateString("en-IN", {
														day: "numeric",
														month: "short",
													})}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* DANGER ZONE */}
			<Card className="border-red-100">
				<CardHeader className="pb-2">
					<CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
				</CardHeader>
				<CardContent>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								className="border-red-200 text-red-500 hover:bg-red-50"
								size="sm"
								variant="outline"
							>
								<Trash2Icon className="mr-1.5 h-3.5 w-3.5" /> Delete Account
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete your account?</AlertDialogTitle>
								<AlertDialogDescription>
									This action is permanent. All your matches, messages, and data
									will be removed.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									className="border-0 bg-red-500 text-white hover:bg-red-600"
									onClick={() => deleteAccount.mutate()}
								>
									Delete Account
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardContent>
			</Card>
		</div>
	);
}
