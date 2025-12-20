import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SubscriptionManagement from '@/components/SubscriptionManagement';

export default function SubscriptionsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header pageTitle="Subscription Management" />
        <div className="flex-1 p-6 overflow-auto">
          <SubscriptionManagement />
        </div>
      </div>
    </div>
  );
}