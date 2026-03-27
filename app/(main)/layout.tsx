import { Sidebar } from "@/components/ui/Sidebar";
import { ChatWidget } from "@/components/chatbot/ChatWidget";

export default function MainLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <ChatWidget />
    </div>
  );
}
