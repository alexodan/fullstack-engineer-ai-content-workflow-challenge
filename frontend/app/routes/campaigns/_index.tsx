export default function NoCampaignSelected() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Select a Campaign
        </h2>
        <p className="text-gray-600">
          Choose a campaign from the sidebar to view its details
        </p>
      </div>
    </div>
  );
}
