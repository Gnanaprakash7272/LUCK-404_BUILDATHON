import React from 'react';
import { Layers, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ShapFeatureImpact {
  feature: string;
  shapValue: number;
  featureValue: number | string;
  impactDirection: 'positive' | 'negative';
}

interface Props {
  shapData?: ShapFeatureImpact[] | null;
  predictionName?: string;
}

export const ShapExplanationView: React.FC<Props> = ({ shapData = null, predictionName }) => {
  const hasShapData = shapData && shapData.length > 0;

  return (
    <Card
      title="Feature Impact (Explainable AI)"
      subtitle="Model feature attribution insights"
      badge={
        hasShapData ? (
          <Badge variant="online">SHAP ACTIVE</Badge>
        ) : (
          <Badge variant="outline">STANDBY</Badge>
        )
      }
    >
      {!hasShapData ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
          <div className="inline-flex p-3 rounded-2xl bg-white text-sky-600 border border-slate-200 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Explainable SHAP Interface Ready
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Connects seamlessly with backend TreeSHAP values for real-time waterfall feature contribution graphs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-slate-700 font-semibold">
            Feature contributions toward: <strong className="text-sky-700">{predictionName}</strong>
          </div>

          <div className="space-y-2 text-xs">
            {shapData.map((item, i) => {
              const isPos = item.shapValue > 0;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{item.feature}</span>
                    <span className="text-slate-400 text-[11px]">({item.featureValue})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden flex items-center">
                      <div
                        className={`h-full ${isPos ? 'bg-rose-500 ml-auto' : 'bg-sky-600 mr-auto'}`}
                        style={{ width: `${Math.min(Math.abs(item.shapValue) * 100, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`font-bold min-w-[50px] text-right ${
                        isPos ? 'text-rose-600' : 'text-sky-700'
                      }`}
                    >
                      {isPos ? `+${item.shapValue.toFixed(2)}` : item.shapValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
