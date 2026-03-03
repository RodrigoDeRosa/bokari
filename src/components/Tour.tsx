import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export interface TourStep {
  target: string | null;
  title: string;
  description: string;
  placement: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export function useTourSteps() {
  const { t } = useTranslation('tour');

  return useMemo(() => {
    const budget: TourStep[] = [
      { target: null, title: t('budget.welcome.title'), description: t('budget.welcome.description'), placement: 'center' },
      { target: '[data-tour="node-palette"]', title: t('budget.palette.title'), description: t('budget.palette.description'), placement: 'top' },
      { target: '[data-tour="canvas"]', title: t('budget.canvas.title'), description: t('budget.canvas.description'), placement: 'bottom' },
      { target: '[data-tour="toolbar-tabs"]', title: t('budget.tabs.title'), description: t('budget.tabs.description'), placement: 'bottom' },
      { target: '[data-tour="toolbar-actions"]', title: t('budget.toolbar.title'), description: t('budget.toolbar.description'), placement: 'bottom' },
      { target: '[data-tour="toolbar-locale"]', title: t('budget.locale.title'), description: t('budget.locale.description'), placement: 'bottom' },
      { target: '[data-tour="help-button"]', title: t('budget.help.title'), description: t('budget.help.description'), placement: 'bottom' },
    ];

    const mobileBudget: TourStep[] = [
      { target: null, title: t('mobileBudget.welcome.title'), description: t('mobileBudget.welcome.description'), placement: 'center' },
      { target: '[data-tour="mobile-cards"]', title: t('mobileBudget.list.title'), description: t('mobileBudget.list.description'), placement: 'bottom' },
      { target: '[data-tour="mobile-fab"]', title: t('mobileBudget.addNode.title'), description: t('mobileBudget.addNode.description'), placement: 'top' },
      { target: '[data-tour="toolbar-tabs"]', title: t('mobileBudget.tabs.title'), description: t('mobileBudget.tabs.description'), placement: 'bottom' },
      { target: '[data-tour="toolbar-locale"]', title: t('mobileBudget.locale.title'), description: t('mobileBudget.locale.description'), placement: 'bottom' },
      { target: '[data-tour="mobile-menu"]', title: t('mobileBudget.moreActions.title'), description: t('mobileBudget.moreActions.description'), placement: 'bottom' },
    ];

    const projections: TourStep[] = [
      { target: null, title: t('projections.intro.title'), description: t('projections.intro.description'), placement: 'center' },
      { target: '[data-tour="proj-summary"]', title: t('projections.summary.title'), description: t('projections.summary.description'), placement: 'bottom' },
      { target: '[data-tour="proj-controls"]', title: t('projections.controls.title'), description: t('projections.controls.description'), placement: 'bottom' },
      { target: '[data-tour="proj-chart"]', title: t('projections.chart.title'), description: t('projections.chart.description'), placement: 'top' },
      { target: '[data-tour="proj-scenarios"]', title: t('projections.scenarios.title'), description: t('projections.scenarios.description'), placement: 'top' },
      { target: '[data-tour="proj-settings"]', title: t('projections.settings.title'), description: t('projections.settings.description'), placement: 'top' },
      { target: '[data-tour="proj-table"]', title: t('projections.table.title'), description: t('projections.table.description'), placement: 'top' },
    ];

    return { budget, mobileBudget, projections };
  }, [t]);
}

interface TourProps {
  open: boolean;
  onClose: () => void;
  steps: TourStep[];
}

const OVERLAY_Z = 1300;
const TOOLTIP_Z = 1301;
const PADDING = 8;

const Tour = ({ open, onClose, steps }: TourProps) => {
  const { t } = useTranslation('tour');
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
                {t('nav.skip')}
              </Button>
            )}
            {!isFirst && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setStep((s) => s - 1)}
                sx={{ textTransform: 'none' }}
              >
                {t('nav.back')}
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
              {isLast ? t('nav.finish') : t('nav.next')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default Tour;
