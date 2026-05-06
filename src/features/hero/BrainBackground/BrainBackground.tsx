import { BrainPointCloudCanvas } from './BrainPointCloudCanvas';

export function BrainBackground() {
  return (
    <div className="absolute inset-0 z-[1] bg-slate-50 pointer-events-auto">
      <BrainPointCloudCanvas />
    </div>
  );
}
