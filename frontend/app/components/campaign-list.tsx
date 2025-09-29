import { NavLink } from "react-router";
import type { Campaign } from "../types";
import { Badge } from "./ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (!campaigns || campaigns.length === 0) {
    return <div className="p-4">No campaigns found.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <button className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          + New Campaign
        </button>
      </div>
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <NavLink
            key={campaign.id}
            to={`/campaigns/${campaign.id}`}
            className={({ isActive }) =>
              `block transition-all ${isActive ? "ring-2 ring-blue-500" : ""}`
            }
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {campaign.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {campaign.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    {campaign.contents?.length || 0} pieces
                  </span>
                  <Badge
                    variant={
                      campaign.contents?.length ? "default" : "secondary"
                    }
                  >
                    {campaign.contents?.length ? "Active" : "Draft"}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
