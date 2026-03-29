"use client";

import { ArrowLeftIcon, FlagIcon, SendIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

type Props = { params: Promise<{ matchId: string }> };

const REPORT_REASONS = [
	"Harassment",
	"Spam",
	"Fake profile",
	"Inappropriate content",
	"Scam",
	"Other",
];

export default function ChatPage({ params }: Props) {
	const { matchId } = use(params);
	const [text, setText] = useState("");
	const [reportOpen, setReportOpen] = useState(false);
	const [reportReason, setReportReason] = useState("");
	const [reportDesc, setReportDesc] = useState("");
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const hasMarkedRead = useRef(false);

	const { data: profile } = api.profile.getMe.useQuery();
	const {
		data: messages,
		isLoading,
		refetch,
	} = api.message.getMessages.useQuery({ matchId });
	const { data: conversations } = api.message.getConversations.useQuery();

	const conv = conversations?.find((c) => c.id === matchId);
	const otherUser = conv?.otherUser;

	const { mutate: markReadMutate } = api.message.markRead.useMutation();

	useEffect(() => {
		if (messages && !hasMarkedRead.current) {
			hasMarkedRead.current = true;
			markReadMutate({ matchId });
		}
	}, [markReadMutate, matchId, messages]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const send = api.message.send.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: () => {
			setText("");
			void refetch();
		},
	});

	const deleteForSelf = api.message.deleteForSelf.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: () => {
			void refetch();
			toast.success("Message deleted.");
		},
	});

	const deleteBoth = api.message.deleteChatForBoth.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: () => {
			void refetch();
			toast.success("Chat cleared for both.");
		},
	});

	const createReport = api.report.create.useMutation({
		onError: (err: { message: string }) => toast.error(err.message),
		onSuccess: () => {
			setReportOpen(false);
			setReportReason("");
			setReportDesc("");
			toast.success("Report submitted. Thank you.");
		},
	});

	function handleSend() {
		if (!text.trim()) return;
		send.mutate({ content: text.trim(), matchId });
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	// Build avatar for otherUser
	const otherUserPhotos: string[] = otherUser?.photos
		? (JSON.parse(otherUser.photos) as string[])
		: [];
	const otherUserFirstPhoto = otherUserPhotos[0];

	const myId = profile?.id;
	const EMOJIS = ["❤️", "😊", "😂", "🔥"];

	return (
		<div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
			{/* HEADER */}
			<div className="flex items-center justify-between border-rose-100 border-b px-4 py-3">
				<div className="flex items-center gap-3">
					<Link
						className="text-gray-400 transition hover:text-gray-700"
						href="/Seeker/messages"
					>
						<ArrowLeftIcon className="h-4 w-4" />
					</Link>
					{otherUser && (
						<div className="flex items-center gap-2">
							{otherUserFirstPhoto ? (
								<Image
									alt={otherUser.name}
									className="h-9 w-9 rounded-xl object-cover"
									height={36}
									src={otherUserFirstPhoto}
									unoptimized
									width={36}
								/>
							) : (
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-500 text-sm">
									{otherUser.name.charAt(0).toUpperCase()}
								</div>
							)}
							<div>
								<p className="font-bold text-gray-900 text-sm">
									{otherUser.name}
								</p>
								<p className="text-[10px] text-rose-400">Matched 💕</p>
							</div>
						</div>
					)}
				</div>
				<div className="flex gap-2">
					{otherUser && (
						<button
							className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50"
							onClick={() => setReportOpen(true)}
							type="button"
						>
							<FlagIcon className="h-3.5 w-3.5" />
						</button>
					)}
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<button
								className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50"
								type="button"
							>
								<Trash2Icon className="h-3.5 w-3.5" />
							</button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Clear chat?</AlertDialogTitle>
								<AlertDialogDescription>
									This will delete all messages for both users and cannot be
									undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									className="border-0 bg-rose-500 text-white hover:bg-rose-600"
									onClick={() => deleteBoth.mutate({ matchId })}
								>
									Clear Chat
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			{/* MESSAGES */}
			<div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<Skeleton className="h-10 rounded-2xl" key={i} />
						))}
					</div>
				) : !messages?.length ? (
					<div className="flex h-full flex-col items-center justify-center py-10 text-center">
						<p className="mb-2 text-3xl">💬</p>
						<p className="text-gray-500 text-sm">
							Say hello! Start the conversation.
						</p>
					</div>
				) : (
					messages.map((msg) => {
						const isMe = msg.senderId === myId;
						return (
							<div
								className={`group flex ${isMe ? "justify-end" : "justify-start"}`}
								key={msg.id}
							>
								<div
									className={`relative max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
										isMe
											? "rounded-br-sm bg-gradient-to-br from-rose-500 to-pink-500 text-white"
											: "rounded-bl-sm bg-gray-100 text-gray-900"
									}`}
								>
									{msg.content && <p>{msg.content}</p>}
									{msg.mediaType === "emoji" && msg.mediaUrl && (
										<p className="text-2xl">{msg.mediaUrl}</p>
									)}
									{msg.mediaType === "image" && msg.mediaUrl && (
										<Image
											alt="Shared media"
											className="mt-1 max-w-48 rounded-xl"
											height={200}
											src={msg.mediaUrl}
											unoptimized
											width={200}
										/>
									)}
									<p
										className={`mt-1 text-[10px] ${isMe ? "text-white/70" : "text-gray-400"}`}
									>
										{new Date(msg.createdAt).toLocaleTimeString("en-IN", {
											hour: "2-digit",
											minute: "2-digit",
										})}
										{isMe && (
											<span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>
										)}
									</p>
									{isMe && (
										<button
											className="absolute top-1/2 -left-6 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:text-red-500 group-hover:flex"
											onClick={() =>
												deleteForSelf.mutate({ messageId: msg.id })
											}
											type="button"
										>
											<Trash2Icon className="h-2.5 w-2.5" />
										</button>
									)}
								</div>
							</div>
						);
					})
				)}
				<div ref={bottomRef} />
			</div>

			{/* INPUT */}
			<div className="border-rose-100 border-t p-3">
				<div className="flex gap-2">
					{EMOJIS.map((emoji) => (
						<button
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-base transition hover:bg-rose-50"
							key={emoji}
							onClick={() =>
								send.mutate({ matchId, mediaType: "emoji", mediaUrl: emoji })
							}
							type="button"
						>
							{emoji}
						</button>
					))}
					<Input
						className="border-rose-100 focus-visible:ring-rose-400"
						onChange={(e) => setText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						value={text}
					/>
					<Button
						className="shrink-0 border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white"
						disabled={!text.trim() || send.isPending}
						onClick={handleSend}
						size="icon"
					>
						<SendIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* REPORT DIALOG */}
			<Dialog onOpenChange={setReportOpen} open={reportOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Report User</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<p className="text-gray-500 text-sm">Select a reason</p>
							<div className="grid grid-cols-2 gap-2">
								{REPORT_REASONS.map((reason) => (
									<button
										className={`rounded-xl border px-3 py-2 font-medium text-sm transition ${
											reportReason === reason
												? "border-rose-500 bg-rose-50 text-rose-600"
												: "border-gray-200 text-gray-700 hover:border-rose-200"
										}`}
										key={reason}
										onClick={() => setReportReason(reason)}
										type="button"
									>
										{reason}
									</button>
								))}
							</div>
						</div>
						<div className="space-y-1.5">
							<p className="text-gray-500 text-sm">
								Additional details (optional)
							</p>
							<Input
								className="border-rose-100"
								onChange={(e) => setReportDesc(e.target.value)}
								placeholder="Describe the issue..."
								value={reportDesc}
							/>
						</div>
						<Button
							className="w-full border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white"
							disabled={!reportReason || !otherUser || createReport.isPending}
							onClick={() => {
								if (!otherUser) return;
								createReport.mutate({
									description: reportDesc || undefined,
									reason: reportReason,
									reportedId: otherUser.id,
								});
							}}
						>
							{createReport.isPending ? "Submitting..." : "Submit Report"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
