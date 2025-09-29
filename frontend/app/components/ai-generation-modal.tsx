import { useState, useEffect } from "react";
import { useNavigate, useFetcher } from "react-router";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AIGenerationModalProps {
  open: boolean;
  campaignId: string;
}

const AI_MODELS = [
  { value: "openai-gpt4", label: "GPT-4 (OpenAI)" },
  { value: "anthropic-claude", label: "Claude (Anthropic)" },
  { value: "openai-gpt3.5", label: "GPT-3.5 (OpenAI)" },
];

export function AIGenerationModal({
  open,
  campaignId,
}: AIGenerationModalProps) {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [selectedModel, setSelectedModel] = useState("");

  const handleClose = () => {
    navigate(".", { replace: true });
  };

  const isGenerating = fetcher.state === "submitting";

  // Close modal when generation completes successfully
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      handleClose();
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel || isGenerating) return;
    
    const formData = new FormData();
    formData.append("campaignId", campaignId);
    formData.append("model", selectedModel);
    
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate AI Content</DialogTitle>
          <DialogDescription>
            Select an AI model to generate content for your campaign.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fetcher.data?.error && (
            <div className="text-sm text-red-600">
              {fetcher.data.error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedModel || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
