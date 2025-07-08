import { toast } from 'react-toastify';

export const notify = async ({ title, msg }: { title: string; msg?: string }) => {
  if (window.Notification && Notification.permission !== 'granted') {
    Notification.requestPermission((status) => {
      // this will allow us to use Notification.permission in Chrome/Safari
      if (Notification.permission !== status) {
        // @ts-ignore
        Notification.permission = status;
      }
    });
  }
  if (Notification.permission === 'granted') {
    let n = new Notification(title, {
      body: msg,
    });
  } else {
    toast(title, { autoClose: false });
  }
};
