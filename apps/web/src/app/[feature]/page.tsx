import { notFound } from "next/navigation";
import FeaturePreview from "../../components/feature-preview";

const features = new Set(["messages", "household", "compatibility", "stories", "trustscore", "agreement", "personality"]);

export default async function FeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params;
  if (!features.has(feature)) notFound();
  return <FeaturePreview feature={feature} />;
}
