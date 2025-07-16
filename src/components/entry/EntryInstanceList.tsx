import { selectedEntryInstancesArrayAtom } from '@/atoms/chart';
import { useAtomValue } from 'jotai';
import EntryInstanceForm from './EntryInstanceForm';

const EntryInstanceList = () => {
  const entryInstancesArray = useAtomValue(selectedEntryInstancesArrayAtom);
  return (
    <div className="flex flex-col items-center gap-2">
      {entryInstancesArray?.length
        ? entryInstancesArray.map((item) => <EntryInstanceForm key={item.id} entryInstance={item} />)
        : null}
    </div>
  );
};

export default EntryInstanceList;
