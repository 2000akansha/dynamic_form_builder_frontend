import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import router from './routes';
import Loader from './components/Loader';
import InactivityHandler from './components/InactivityHandler';
// import EnvironmentBanner from './components/EnvironmentBanner.jsx';
function App() {
  return (
    <>
      {/* <EnvironmentBanner /> */}
      <Suspense fallback={<Loader />}>

       <InactivityHandler>
            <RouterProvider router={router()} />

</InactivityHandler>

      </Suspense>

    </>
  );
}

export default App;