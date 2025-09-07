import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { SystemInfo } from "@/components/admin/SystemInfo";

export default function Admin() {
  const [activeSection, setActiveSection] = useState("usuarios");

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Administração</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie configurações e usuários do sistema
          </p>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <AdminTabs activeSection={activeSection} onSectionChange={setActiveSection} />

          <TabsContent value="usuarios" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            <AuditLogs />
          </TabsContent>

          <TabsContent value="sistema" className="space-y-6">
            <SystemInfo />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}