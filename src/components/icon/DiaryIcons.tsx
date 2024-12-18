import { FC, SVGProps } from 'react';
import HomeSvg from '@/../public/svgs/icons/home-icon.svg?component';
import AddSvg from '@/../public/svgs/icons/add-icon.svg?component';
import ReminderSvg from '@/../public/svgs/icons/reminder-icon.svg?component';
import SettingsSvg from '@/../public/svgs/icons/settings-icon.svg?component';
import EditSvg from '@/../public/svgs/icons/edit-icon.svg?component';
import CheckSvg from '@/../public/svgs/icons/check.svg?component';

interface IconComponents {
  HomeSvg: FC<SVGProps<SVGElement>>;
  AddSvg: FC<SVGProps<SVGElement>>;
  ReminderSvg: FC<SVGProps<SVGElement>>;
  SettingsSvg: FC<SVGProps<SVGElement>>;
  EditSvg: FC<SVGProps<SVGElement>>;
  CheckSvg: FC<SVGProps<SVGElement>>;
}

const icons: IconComponents = {
  HomeSvg,
  AddSvg,
  ReminderSvg,
  SettingsSvg,
  EditSvg,
  CheckSvg,
};

export default icons;
