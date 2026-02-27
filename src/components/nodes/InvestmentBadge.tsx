import { useState, useCallback } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface InvestmentBadgeProps {
  isInvestment: boolean;
  expectedReturn: number;
  onToggle: () => void;
  onReturnChange: (rate: number) => void;
}

export default function InvestmentBadge({
  isInvestment,
  expectedReturn,
  onToggle,
  onReturnChange,
}: InvestmentBadgeProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(expectedReturn));

  const handleCommit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onReturnChange(parsed);
    } else {
      setDraft(String(expectedReturn));
    }
  }, [draft, expectedReturn, onReturnChange]);

  return (
    <div
      className={`investment-badge ${isInvestment ? 'active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <TrendingUpIcon
        className="investment-icon"
        sx={{ fontSize: 11 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      />
      {isInvestment && (
        editing ? (
          <input
            className="investment-return-input"
            type="number"
            value={draft}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleCommit();
              if (e.key === 'Escape') {
                setDraft(String(expectedReturn));
                setEditing(false);
              }
            }}
          />
        ) : (
          <span
            className="investment-return-label"
            onClick={(e) => {
              e.stopPropagation();
              setDraft(String(expectedReturn));
              setEditing(true);
            }}
          >
            {expectedReturn}%
          </span>
        )
      )}
    </div>
  );
}
