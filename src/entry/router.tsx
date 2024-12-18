import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../oldpage/App';
import AddPage from '../oldpage/AddPage';
import EntryPage from '../oldpage/EntryPage';
import ReminderPage from '../oldpage/ReminderPage';
import SettingsPage from '../oldpage/SettingsPage';
import PlaygroundPage from '../oldpage/PlaygroundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'entry',
        element: <EntryPage />,
      },
      {
        path: 'add',
        element: <AddPage />,
      },
      {
        path: 'reminder',
        element: <ReminderPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'playground',
        element: <PlaygroundPage />,
      },
      {
        path: '',
        element: <Navigate to="/entry" />,
      },
    ],
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);

export default router;
