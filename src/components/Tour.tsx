import { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export interface TourStep {
  target: string | null;
  title: string;
  description: string;
  placement: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export const BUDGET_TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: 'Welcome to Bokari',
    description:
      'Bokari helps you build a visual budget tree and project your investments over time. Let\u2019s take a quick tour!',
    placement: 'center',
  },
  {
    target: '[data-tour="node-palette"]',
    title: 'Node Palette',
    description:
      'Drag nodes from here onto the canvas to build your budget tree. Each color represents a different node type.',
    placement: 'top',
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Budget Canvas',
    description:
      'This is your workspace. Drop nodes here, connect them with edges, and edit values inline to design your budget.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="toolbar-tabs"]',
    title: 'Tabs',
    description:
      'Switch between the Budget view (build your tree) and Projections (see how investments grow over time).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="toolbar-actions"]',
    title: 'Toolbar Actions',
    description:
      'Undo, redo, save, auto-layout, export, and import your budget from here.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="help-button"]',
    title: 'Help',
    description:
      'Open the help drawer anytime for detailed guides. You can also restart this tour from there.',
    placement: 'bottom',
  },
];

export const MOBILE_BUDGET_TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: 'Welcome to Bokari',
    description:
      'Bokari helps you build a visual budget tree and project your investments over time. Let\u2019s take a quick tour!',
    placement: 'center',
  },
  {
    target: '[data-tour="mobile-cards"]',
    title: 'Your Budget',
    description:
      'Your budget items are listed here as cards. Tap a card to drill into its children, or tap the edit icon to change its values.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="mobile-fab"]',
    title: 'Add Nodes',
    description:
      'Tap this button to create new nodes. Choose a type and start building your budget tree.',
    placement: 'top',
  },
  {
    target: '[data-tour="toolbar-tabs"]',
    title: 'Tabs',
    description:
      'Switch between Budget (build your tree) and Projections (see how investments grow over time).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="mobile-menu"]',
    title: 'More Actions',
    description:
      'Access undo, redo, save, export, import, and help from this menu.',
    placement: 'bottom',
  },
];

export const PROJECTIONS_TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: 'Projections',
    description:
      'This tab shows how your investments could grow over time based on your budget. Let\u2019s walk through it!',
    placement: 'center',
  },
  {
    target: '[data-tour="proj-summary"]',
    title: 'Portfolio Summary',
    description:
      'A quick overview of your projected portfolio value based on current contributions, returns, and time horizon.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="proj-controls"]',
    title: 'Controls',
    description:
      'Choose a time horizon (5\u201340 years), switch between a total view and per-asset breakdown, and filter which investments to show.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="proj-chart"]',
    title: 'Growth Chart',
    description:
      'Visualize contributions vs. compound growth over time. The stacked areas show how much comes from what you put in vs. what the market earns you.',
    placement: 'top',
  },
  {
    target: '[data-tour="proj-scenarios"]',
    title: 'Explore Scenarios',
    description:
      'Adjust monthly contributions to see what-if scenarios. Increase or decrease amounts per asset and watch the chart and summary update instantly.',
    placement: 'top',
  },
  {
    target: '[data-tour="proj-settings"]',
    title: 'Investment Settings',
    description:
      'Set the expected annual return for each investment and model income growth over time. These drive the compound growth calculations.',
    placement: 'top',
  },
  {
    target: '[data-tour="proj-table"]',
    title: 'Yearly Breakdown',
    description:
      'Expand this section for a year-by-year table with exact contribution, growth, and portfolio values.',
    placement: 'top',
  },
];

interface TourProps {
  open: boolean;
  onClose: () => void;
  steps: TourStep[];
}

const OVERLAY_Z = 1300;
const TOOLTIP_Z = 1301;
const PADDING = 8;

const Tour = ({ open, onClose, steps }: TourProps) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const updateRect = useCallback(() => {
    const target = current.target;
    if (!target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [current.target]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
  }, [open]);

  // Scroll target into view, then measure its rect
  useEffect(() => {
    if (!open) return;

    const target = current.target;
    if (target) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Measure after scroll settles
        const timer = setTimeout(updateRect, 350);
        return () => clearTimeout(timer);
      }
    }

    updateRect();
  }, [open, step, current.target, updateRect]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [open, updateRect]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobileViewport = vw < 600;
  const tooltipWidth = isMobileViewport ? Math.min(vw - 32, 280) : 320;
  const edgePad = isMobileViewport ? 8 : 16;

  // Spotlight hole dimensions (with padding)
  const holeX = rect ? rect.left - PADDING : 0;
  const holeY = rect ? rect.top - PADDING : 0;
  const holeW = rect ? rect.width + PADDING * 2 : 0;
  const holeH = rect ? rect.height + PADDING * 2 : 0;

  // Tooltip positioning
  const getTooltipStyle = (): React.CSSProperties => {
    const gap = 12;

    if (!rect || current.placement === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: tooltipWidth,
      };
    }

    let top: number;
    let left: number;

    switch (current.placement) {
      case 'top':
        top = rect.top - gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
    }

    // Clamp horizontally
    left = Math.max(edgePad, Math.min(left, vw - tooltipWidth - edgePad));

    if (current.placement === 'top') {
      // Position above: anchor from bottom
      const tooltipEl = tooltipRef.current;
      const tooltipH = tooltipEl?.offsetHeight ?? 120;
      top = Math.max(edgePad, top - tooltipH);
    } else {
      top = Math.max(edgePad, Math.min(top, vh - 200));
    }

    // If tooltip would overflow below viewport, flip to above the target
    if (current.placement === 'bottom') {
      const tooltipEl = tooltipRef.current;
      const tooltipH = tooltipEl?.offsetHeight ?? 160;
      if (top + tooltipH > vh - edgePad) {
        top = Math.max(edgePad, rect.top - gap - tooltipH);
      }
    }

    return { position: 'fixed', top, left, width: tooltipWidth };
  };

  return (
    <>
      {/* SVG overlay with spotlight hole */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: OVERLAY_Z,
          pointerEvents: 'none',
        }}
      >
        <svg width={vw} height={vh} style={{ display: 'block' }}>
          <defs>
            <mask id="tour-mask">
              <rect x={0} y={0} width={vw} height={vh} fill="white" />
              {rect && (
                <rect
                  x={holeX}
                  y={holeY}
                  width={holeW}
                  height={holeH}
                  rx={8}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x={0}
            y={0}
            width={vw}
            height={vh}
            fill="rgba(0,0,0,0.5)"
            mask="url(#tour-mask)"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          />
        </svg>
      </Box>

      {/* Tooltip */}
      <Paper
        ref={tooltipRef}
        elevation={8}
        sx={{
          zIndex: TOOLTIP_Z,
          p: isMobileViewport ? 2 : 2.5,
          ...getTooltipStyle(),
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {current.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {current.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            {step + 1} / {steps.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isLast && (
              <Button size="small" onClick={onClose} sx={{ textTransform: 'none' }}>
                Skip
              </Button>
            )}
            {!isFirst && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setStep((s) => s - 1)}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                if (isLast) {
                  onClose();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              sx={{ textTransform: 'none' }}
            >
              {isLast ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default Tour;
