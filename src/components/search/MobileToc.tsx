import { useState } from "react";
import { List, ChevronUp, X } from "lucide-react";

interface TocItem {
  id: string;
  label: string;
  count?: number;
}

interface MobileTocProps {
  items: TocItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

const MobileToc = ({ items, activeSection, onNavigate }: MobileTocProps) => {
  const [open, setOpen] = useState(false);

  const activeLabel = items.find((i) => i.id === activeSection)?.label || "Contents";

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`relative z-50 bg-card border-t border-border shadow-lg transition-all duration-300 ease-out ${
          open ? "rounded-t-xl max-h-[60vh]" : "max-h-14"
        }`}
      >
        {/* Handle / Toggle bar */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3.5 gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <List className="h-4 w-4 text-accent shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate">
              {activeLabel}
            </span>
          </div>
          {open ? (
            <X className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Items list */}
        {open && (
          <div className="overflow-y-auto max-h-[calc(60vh-3.5rem)] pb-safe">
            <ul className="px-2 pb-3 space-y-0.5">
              {items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-accent/10 text-foreground font-semibold border-l-2 border-accent"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                      {item.count !== undefined && (
                        <span className="text-muted-foreground/50 ml-1.5 text-xs">
                          ({item.count})
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileToc;
