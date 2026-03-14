import { List } from "lucide-react";

interface TocItem {
  id: string;
  label: string;
  count?: number;
}

interface TocSidebarProps {
  items: TocItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

const TocSidebar = ({ items, activeSection, onNavigate }: TocSidebarProps) => (
  <nav className="hidden lg:block w-48 shrink-0">
    <div className="sticky top-24">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
        <List className="h-3 w-3" /> Contents
      </p>
      <ul className="space-y-1 pl-3">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`block text-[11px] py-1 leading-tight ${
                  isActive
                    ? "text-foreground border-l-2 border-foreground pl-3 -ml-[2px]"
                    : "text-muted-foreground hover:text-foreground pl-3"
                }`}
              >
                {item.label}
                {item.count !== undefined && (
                  <span className="text-muted-foreground/50 ml-1">({item.count})</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  </nav>
);

export default TocSidebar;
