import { Route, Router } from "@solidjs/router";
import Layout from "./Layout";
import Index from "./routes/Index";
import Empty from "./routes/Empty";
import { AppContextProvider } from "./lib/state/provider";
import NewSpace from "./routes/NewSpace";
import ContentView from "./routes/ContentView";

export default function Root() {
  return <AppContextProvider>
    <Router>
      <Route path="/" component={Index} />
      <Route path="/new-space" component={NewSpace} />
      <Route path="/app" component={Layout}>
        <Route path="" component={Empty} />
        <Route path=":path" component={ContentView} />
      </Route>
    </Router>
  </AppContextProvider>
}
