import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ArrowLeft, Package, Truck, CheckCircle2, Printer } from 'lucide-react';

const MOCK_ORDERS = [
  {
    status: 'delivered' as const,
    trackingNumber: 'SN-2026-XK9F3',
    estimatedDelivery: '2026-03-28',
    orderedAt: '2026-03-20',
  },
  {
    status: 'shipped' as const,
    trackingNumber: 'SN-2026-AB2D7',
    estimatedDelivery: '2026-04-05',
    orderedAt: '2026-03-30',
  },
  {
    status: 'printed' as const,
    trackingNumber: undefined,
    estimatedDelivery: '2026-04-10',
    orderedAt: '2026-04-01',
  },
];

const steps = [
  { key: 'processing', label: 'Order Placed', icon: Package },
  { key: 'printed', label: 'Printed', icon: Printer },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const statusIndex = (s: string) => steps.findIndex(st => st.key === s);

const OrderTracking = () => {
  const navigate = useNavigate();
  const { projects } = useBooks();
  const orderedProjects = projects.filter(p => p.status === 'ordered');

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">Order Tracking</span>
      </header>

      {orderedProjects.length === 0 ? (
        <div className="flex flex-col items-center pt-20 px-8 animate-fade-in">
          <Package size={32} strokeWidth={1.2} className="text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="px-6 space-y-6">
          {orderedProjects.map((project, oi) => {
            const mock = MOCK_ORDERS[oi % MOCK_ORDERS.length];
            const currentStep = statusIndex(mock.status);

            return (
              <div key={project.id} className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
                {/* Book info */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {project.coverPhoto ? (
                      <img src={project.coverPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-[10px]">S</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.title}</p>
                    <p className="text-[11px] text-muted-foreground">Ordered {new Date(mock.orderedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-primary' : 'bg-muted'
                          }`}>
                            <Icon size={14} strokeWidth={1.5} className={isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'} />
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`w-0.5 h-6 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`text-xs font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                            {isCurrent && <span className="ml-1.5 text-primary">●</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking info */}
                {mock.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-[11px] text-muted-foreground">
                      Tracking: <span className="font-mono text-foreground">{mock.trackingNumber}</span>
                    </p>
                    {mock.estimatedDelivery && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Est. delivery: {new Date(mock.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
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
