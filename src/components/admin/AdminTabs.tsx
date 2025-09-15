import { Users, Settings, Shield, Database } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminTabsProps {
  activeSection: string;
  onSectionChange: (value: string) => void;
}

const tabItems = [
  { value: "configuracoes", label: "Configurações", icon: Settings },
  { value: "sistema", label: "Sistema", icon: Database },
];

export function AdminTabs({ activeSection, onSectionChange }: AdminTabsProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Select value={activeSection} onValueChange={onSectionChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {tabItems.find(item => item.value === activeSection)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {tabItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <div className="flex items-center">
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <TabsList className="grid w-full grid-cols-4">
      {tabItems.map((item) => (
        <TabsTrigger key={item.value} value={item.value}>
          <item.icon className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{item.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}