import Spinner from "@/app/[locale]/components/elements/Spinner";

export default function Loading() {
  return (
    <div className="h-screen center bg-black">
      <Spinner variant="loading" />
    </div>
  );
}
