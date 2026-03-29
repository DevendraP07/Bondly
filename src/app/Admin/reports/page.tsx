"use client";

import { ShieldIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

const STATUS_COLORS: Record<string, string> = {
	pending: "border-amber-200 bg-amber-50 text-amber-700",
	resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
	reviewed: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function AdminReportsPage() {
	const [statusFilter, setStatusFilter] = useState("all");
	const { data: reports, isLoading, refetch } = api.report.getAll.useQuery();

	const resolve = api.report.resolve.useMutation({
		onError: (e) => toast.error(e.message),
		onSuccess: () => {
			void refetch();
			toast.success("Report updated!");
		},
	});

	const filtered =
		reports?.filter(
			(r) => statusFilter === "all" || r.status === statusFilter,
		) ?? [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-black text-3xl text-gray-900">Reports</h1>
				<p className="mt-1 text-gray-500 text-sm">
					User-submitted safety reports
				</p>
			</div>

			<Select onValueChange={setStatusFilter} value={statusFilter}>
				<SelectTrigger className="w-40 border-rose-100">
					<SelectValue placeholder="Filter status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Reports</SelectItem>
					<SelectItem value="pending">Pending</SelectItem>
					<SelectItem value="reviewed">Reviewed</SelectItem>
					<SelectItem value="resolved">Resolved</SelectItem>
				</SelectContent>
			</Select>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton className="h-28 rounded-2xl" key={i} />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 border-dashed py-16 text-center">
					<ShieldIcon className="mb-3 h-10 w-10 text-rose-200" />
					<p className="text-gray-500 text-sm">No reports found</p>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((r) => (
						<div
							className="rounded-2xl border border-rose-100 bg-white p-5"
							key={r.id}
						>
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<div className="mb-1 flex items-center gap-2">
										<p className="font-bold text-gray-900 text-sm">
											Reason: {r.reason}
										</p>
										<Badge
											className={`border text-[10px] capitalize ${STATUS_COLORS[r.status] ?? ""}`}
										>
											{r.status}
										</Badge>
									</div>
									<p className="text-gray-500 text-xs">
										<span className="font-medium">{r.reporter.name}</span>{" "}
										reported{" "}
										<span className="font-medium">{r.reported.name}</span>
									</p>
									{r.description && (
										<p className="mt-1 text-gray-400 text-xs">
											{r.description}
										</p>
									)}
									<p className="mt-1 text-gray-400 text-xs">
										{new Date(r.createdAt).toLocaleDateString("en-IN", {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</p>
								</div>
								{r.status === "pending" && (
									<div className="flex gap-2">
										<Button
											className="h-7 border-blue-200 text-blue-600 text-xs hover:bg-blue-50"
											disabled={resolve.isPending}
											onClick={() =>
												resolve.mutate({ id: r.id, status: "reviewed" })
											}
											size="sm"
											variant="outline"
										>
											Mark Reviewed
										</Button>
										<Button
											className="h-7 border-emerald-200 text-emerald-600 text-xs hover:bg-emerald-50"
											disabled={resolve.isPending}
											onClick={() =>
												resolve.mutate({ id: r.id, status: "resolved" })
											}
											size="sm"
											variant="outline"
										>
											Resolve
										</Button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
