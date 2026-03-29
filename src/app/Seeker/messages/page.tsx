"use client";

import { MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

function UserAvatar({
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
				className="h-12 w-12 shrink-0 rounded-2xl object-cover"
				height={48}
				src={firstPhoto}
				unoptimized
				width={48}
			/>
		);
	}
	return (
		<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 font-bold text-rose-500">
			{name.charAt(0).toUpperCase()}
		</div>
	);
}

export default function MessagesPage() {
	const { data: conversations, isLoading } =
		api.message.getConversations.useQuery();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-black text-3xl text-gray-900">Messages</h1>
				<p className="mt-1 text-gray-500 text-sm">Chat with your matches</p>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton className="h-20 rounded-2xl" key={i} />
					))}
				</div>
			) : !conversations?.length ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 border-dashed py-20 text-center">
					<MessageCircleIcon className="mb-3 h-10 w-10 text-rose-200" />
					<p className="font-medium text-gray-500 text-sm">
						No conversations yet
					</p>
					<p className="mt-1 text-gray-400 text-xs">
						Match with someone to start chatting
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{conversations.map((conv) => {
						const timeStr = conv.lastMessage
							? new Date(conv.lastMessage.createdAt).toLocaleTimeString(
									"en-IN",
									{ hour: "2-digit", minute: "2-digit" },
								)
							: "";
						return (
							<Link href={`/Seeker/messages/${conv.id}`} key={conv.id}>
								<div className="flex cursor-pointer items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm">
									<UserAvatar
										name={conv.otherUser.name}
										photos={conv.otherUser.photos}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between">
											<p className="font-bold text-gray-900">
												{conv.otherUser.name}
											</p>
											{timeStr && (
												<p className="text-[11px] text-gray-400">{timeStr}</p>
											)}
										</div>
										{conv.lastMessage ? (
											<p className="mt-0.5 truncate text-gray-500 text-sm">
												{conv.lastMessage.content ??
													(conv.lastMessage.mediaType
														? `📎 ${conv.lastMessage.mediaType}`
														: "")}
											</p>
										) : (
											<p className="mt-0.5 text-rose-400 text-xs">
												Start the conversation 💕
											</p>
										)}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
