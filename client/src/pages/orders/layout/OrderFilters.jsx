import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OrderFilters = ({ statuses, selectedStatus, onSelectStatus }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={selectedStatus === status ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectStatus(status)}
          className={cn(
            "whitespace-nowrap",
            selectedStatus === status && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {status}
        </Button>
      ))}
    </div>
  );
};

export default OrderFilters;
