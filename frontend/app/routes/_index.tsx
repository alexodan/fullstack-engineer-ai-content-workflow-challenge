import type { Route } from "./+types/_index";
import { Outlet, useLoaderData } from "react-router";
import { CampaignList } from "~/components/campaign-list";
import { type Campaign } from "../types";
import { fetchCampaigns } from "~/lib/api";

export async function loader(): Promise<Campaign[]> {
  const campaigns = await fetchCampaigns();
  return campaigns;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Content Workflow" },
    { name: "description", content: "ACME Global Media Campaign Manager" },
  ];
}

export default function HomeLayout() {
  const campaigns = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen">
      <aside className="w-[400px] border-r bg-gray-50/50 dark:bg-gray-800 overflow-y-auto">
        <CampaignList campaigns={campaigns} />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
