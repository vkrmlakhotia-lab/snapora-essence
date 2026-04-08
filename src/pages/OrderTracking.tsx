import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ArrowLeft, Package } from 'lucide-react';

type DeliveryStatus = 'confirmed' | 'printing' | 'dispatched' | 'out_for_delivery' | 'delivered';

const MOCK_ORDERS: Array<{
  status: DeliveryStatus;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  steps: Array<{ key: DeliveryStatus; label: string; timestamp?: string }>;
}> = [
  {
    status: 'dispatched',
    trackingNumber: '1Z999AA10123456784',
    trackingCarrier: 'DPD',
    trackingUrl: 'https://track.dpd.co.uk/',
    steps: [
      { key: 'confirmed', label: 'Order Confirmed', timestamp: '1 Apr 2026, 09:32' },
      { key: 'printing', label: 'Printing', timestamp: 'Estimated 2-3 Apr' },
      { key: 'dispatched', label: 'Dispatched', timestamp: 'Expected 3 Apr' },
      { key: 'out_for_delivery', label: 'Out for Delivery', timestamp: 'Expected 7 Apr' },
      { key: 'delivered', label: 'Delivered', timestamp: 'Expected 7 Apr' },
    ],
  },
  {
    status: 'printing',
    steps: [
      { key: 'confirmed', label: 'Order Confirmed', timestamp: '3 Apr 2026, 14:15' },
      { key: 'printing', label: 'Printing', timestamp: 'Estimated 5-6 Apr' },
      { key: 'dispatched', label: 'Dispatched', timestamp: 'Expected 7 Apr' },
      { key: 'out_for_delivery', label: 'Out for Delivery', timestamp: 'Expected 10 Apr' },
      { key: 'delivered', label: 'Delivered', timestamp: 'Expected 10 Apr' },
    ],
  },
];

const STATUS_ORDER: DeliveryStatus[] = ['confirmed', 'printing', 'dispatched', 'out_for_delivery', 'delivered'];

const OrderTracking = () => {
  const navigate = useNavigate();
  const { projects } = useBooks();
  const orderedProjects = projects.filter(p => p.status === 'ordered');

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-[#007aff]" />
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-foreground pr-10">
          Order Tracking
        </span>
      </header>

      {orderedProjects.length === 0 ? (
        <div className="flex flex-col items-center pt-20 px-8 animate-fade-in">
          <Package size={32} strokeWidth={1.2} className="text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="px-4 pt-5 space-y-6">
          {orderedProjects.map((project, oi) => {
            const mock = MOCK_ORDERS[oi % MOCK_ORDERS.length];
            const currentStatusIndex = STATUS_ORDER.indexOf(mock.status);

            return (
              <div key={project.id} className="animate-fade-in">
                {/* Book summary card */}
                <div className="bg-[#f7f7f7] rounded-[12px] px-4 py-4 flex items-center gap-3 mb-5">
                  <div className="w-[70px] h-[70px] rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {project.coverPhoto ? (
                      <img src={project.coverPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">S</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-[#1a1a1a]">{project.title}</p>
                    <p className="text-[12px] text-[#999] mt-0.5">
                      Order #{mock.trackingNumber ? mock.trackingNumber.slice(-8) : 'SN-20250801'}
                    </p>
                    <p className="text-[14px] font-medium text-[#1a1a1a] mt-0.5">
                      £{(project.pages.length * 1.5 + 3.99).toFixed(2)}
                    </p>
                  </div>
                </div>

                <p className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Delivery Status</p>

                {/* Timeline */}
                <div className="pl-2">
                  {mock.steps.map((step, i) => {
                    const stepIndex = STATUS_ORDER.indexOf(step.key);
                    const isCompleted = stepIndex <= currentStatusIndex;
                    const isCurrent = stepIndex === currentStatusIndex;
                    const isLast = i === mock.steps.length - 1;

                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        {/* Dot + connector */}
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                            isCompleted && !isCurrent ? 'bg-[#33bf66]' :
                            isCurrent ? 'bg-[#007aff]' :
                            'bg-[#d9d9d9]'
                          }`}>
                            {isCompleted && !isCurrent && (
                              <span className="text-white text-[11px] font-bold">✓</span>
                            )}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-[42px] mt-0.5 ${stepIndex < currentStatusIndex ? 'bg-[#33bf66]' : 'bg-[#d9d9d9]'}`} />
                          )}
                        </div>

                        {/* Label + timestamp */}
                        <div className="pb-1">
                          <p className={`text-[15px] font-medium ${isCurrent ? 'text-[#007aff]' : isCompleted ? 'text-[#1a1a1a]' : 'text-[#999]'}`}>
                            {step.label}
                          </p>
                          {step.timestamp && (
                            <p className="text-[12px] text-[#999] mt-0.5">{step.timestamp}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking number card + CTA */}
                {mock.trackingNumber && (
                  <>
                    <div className="bg-[#f7f7f7] rounded-[12px] px-4 py-4 mt-5">
                      <p className="text-[12px] text-[#999]">Tracking Number</p>
                      <p className="text-[14px] font-medium text-[#007aff] mt-1">
                        {mock.trackingCarrier}: {mock.trackingNumber}
                      </p>
                    </div>

                    <button
                      onClick={() => mock.trackingUrl && window.open(mock.trackingUrl, '_blank')}
                      className="w-full h-[50px] bg-[#007aff] text-white rounded-[12px] font-medium text-[15px] mt-3 hover:opacity-90 transition-opacity"
                    >
                      Track with {mock.trackingCarrier}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
