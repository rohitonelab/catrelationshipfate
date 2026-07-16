import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import LandingPage from '@/pages/landing';
import InterrogatePage from '@/pages/interrogate';
import WaitingPage from '@/pages/waiting';
import JoinPage from '@/pages/join';
import VerdictPage from '@/pages/verdict';
import ReportPage from '@/pages/report';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/interrogate" component={InterrogatePage} />
      <Route path="/waiting/:sessionId" component={WaitingPage} />
      <Route path="/join/:sessionId/:partnerBToken" component={JoinPage} />
      <Route path="/verdict/:sessionId" component={VerdictPage} />
      <Route path="/report/:sessionId" component={ReportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
