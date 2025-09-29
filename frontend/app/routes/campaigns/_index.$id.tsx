import { useLoaderData, useSearchParams, Link } from "react-router";
import type { Route } from "./+types/_index.$id";
import { fetchCampaignById, generateAIContent } from "~/lib/api";
import { ContentState, type Campaign } from "../../types";
import { AIGenerationModal } from "~/components/ai-generation-modal";

function getStateLabel(state: ContentState): string {
  return state.replace("_", " ").toLowerCase();
}

export async function loader({ params }: Route.LoaderArgs): Promise<Campaign> {
  const campaign = await fetchCampaignById(params.id);
  return campaign;
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const campaignId = formData.get("campaignId") as string;
  const model = formData.get("model") as string;

  if (!campaignId || !model) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    await generateAIContent(campaignId, model);
    return { success: true };
  } catch (error) {
    console.error("Failed to generate AI content:", error);
    return { success: false, error: "Failed to generate content. Please try again." };
  }
}

export default function CampaignDetail() {
  const campaign = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isGenerateModalOpen = searchParams.get("modal") === "generate";

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <p className="text-gray-600">{campaign.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <div className="text-sm text-gray-500 mb-1">Content Pieces</div>
            <div className="text-2xl font-semibold">
              {campaign.contents?.length || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <div className="text-sm text-gray-500 mb-1">Languages</div>
            <div className="text-2xl font-semibold">
              {new Set(campaign.contents?.map((c) => c.language) || []).size}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <div className="text-sm text-gray-500 mb-1">Complete</div>
            <div className="text-2xl font-semibold">
              {campaign.contents?.length > 0
                ? Math.round(
                    (campaign.contents.filter(
                      (c) => c.state === ContentState.APPROVED,
                    ).length /
                      campaign.contents.length) *
                      100,
                  )
                : 0}
              %
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Content</h2>
            <div className="flex gap-2">
              <Link
                to="?modal=generate"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 no-underline"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate AI Content
              </Link>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Add Content
              </button>
            </div>
          </div>

          {campaign.contents && campaign.contents.length > 0 ? (
            <div className="space-y-4">
              {campaign.contents.map((content) => (
                <div
                  key={content.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {content.language}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          content.state === ContentState.APPROVED
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : content.state === ContentState.REJECTED
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : content.state === ContentState.REVIEWED
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : content.state === ContentState.AI_SUGGESTED
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {getStateLabel(content.state)}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                    {content.text || (
                      <span className="italic text-gray-400">
                        No content yet
                      </span>
                    )}
                  </p>
                  {content.aiMetadata && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      AI Generated •{" "}
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center text-gray-500">
              No content pieces yet. Click "Add Content" to get started.
            </div>
          )}
        </div>
      </div>

      <AIGenerationModal open={isGenerateModalOpen} campaignId={campaign.id} />
    </div>
  );
}
