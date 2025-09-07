import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface Column {
  key: string;
  header: string;
  className?: string;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: Record<string, any>[];
  renderRow: (item: Record<string, any>) => ReactNode;
  renderMobileCard: (item: Record<string, any>) => ReactNode;
}

export function ResponsiveTable({ columns, data, renderRow, renderMobileCard }: ResponsiveTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <Card key={item.id || index}>
            <CardContent className="p-4">
              {renderMobileCard(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => renderRow(item))}
        </TableBody>
      </Table>
    </div>
  );
}