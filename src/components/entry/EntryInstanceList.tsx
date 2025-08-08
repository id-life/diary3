import { selectedEntryInstancesArrayAtom } from '@/atoms/chart';
import { cn } from '@/utils';
import { useAtomValue } from 'jotai';
import EntryInstanceForm from './EntryInstanceForm';

const EntryInstanceList = ({ className }: { className?: string }) => {
  const entryInstancesArray = useAtomValue(selectedEntryInstancesArrayAtom);
  return (
    <div className={cn('mx-4 mt-2 flex flex-col gap-3', className)}>
      {entryInstancesArray?.length
        ? entryInstancesArray.map((item) => <EntryInstanceForm key={item.id} entryInstance={item} />)
        : null}
    </div>
  );
};

export default EntryInstanceList;