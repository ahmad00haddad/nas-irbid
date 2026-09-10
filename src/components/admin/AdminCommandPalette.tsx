import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { LayoutDashboard, Film, Users, HelpCircle, MessageSquare, BarChart3, Settings, Eye, Compass } from "lucide-react";
import { startAdminTour } from "./AdminTour";

type Cmd = { label: string; to?: string; icon: any; adminOnly?: boolean; action?: () => void; hint?: string };

const COMMANDS: Cmd[] = [
  { label: "نظرة عامة", to: "/admin", icon: LayoutDashboard },
  { label: "الحلقات", to: "/admin/episodes", icon: Film, hint: "إضافة وتعديل ونشر" },
  { label: "اقتراحات الجمهور", to: "/admin/suggestions", icon: Users },
  { label: "بنك الأسئلة", to: "/admin/questions", icon: HelpCircle },
  { label: "الرسائل", to: "/admin/messages", icon: MessageSquare },
  { label: "إحصائيات الموقع", to: "/admin/analytics", icon: BarChart3, adminOnly: true },
  { label: "إعدادات الموقع", to: "/admin/settings", icon: Settings, adminOnly: true },
  { label: "معاينة الموقع", to: "/", icon: Eye },
];

export function AdminCommandPalette({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("admin-palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("admin-palette:open", onOpen);
    };
  }, []);

  const items = COMMANDS.filter((c) => isAdmin || !c.adminOnly);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="ابحث عن قسم أو إجراء…" />
      <CommandList>
        <CommandEmpty>لا نتائج مطابقة.</CommandEmpty>
        <CommandGroup heading="الأقسام">
          {items.map((c) => (
            <CommandItem
              key={c.label}
              value={c.label}
              onSelect={() => { setOpen(false); if (c.to) navigate({ to: c.to as "/admin" }); }}
            >
              <c.icon size={15} className="text-primary" />
              <span>{c.label}</span>
              {c.hint && <span className="ms-auto text-[11px] text-muted-foreground">{c.hint}</span>}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="مساعدة">
          <CommandItem value="جولة تعريفية" onSelect={() => { setOpen(false); setTimeout(startAdminTour, 120); }}>
            <Compass size={15} className="text-primary" />
            <span>إعادة الجولة التعريفية</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function openAdminPalette() {
  window.dispatchEvent(new Event("admin-palette:open"));
}
