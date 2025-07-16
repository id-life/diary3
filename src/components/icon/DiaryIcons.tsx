import CheckSvg from '@/../public/svgs/icons/check.svg?component';
import EditSvg from '@/../public/svgs/icons/edit-icon.svg?component';
import { FC, SVGProps } from 'react';

interface IconComponents {
  EditSvg: FC<SVGProps<SVGElement>>;
  CheckSvg: FC<SVGProps<SVGElement>>;
}

const icons: IconComponents = {
  EditSvg,
  CheckSvg,
};

export default icons;
