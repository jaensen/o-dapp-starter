import {
  faPeopleArrows,
} from "@fortawesome/free-solid-svg-icons";
import Transactions from "./o-banking/pages/Transactions.svelte";
import Tokens from "./o-banking/pages/Tokens.svelte";
import Trusts from "./o-banking/pages/Trusts.svelte";
import Graph from "./o-banking/pages/Graph.svelte";
import { PageManifest } from "@o-platform/o-interfaces/dist/pageManifest";
import { DappManifest } from "@o-platform/o-interfaces/dist/dappManifest";
import { RuntimeDapp } from "@o-platform/o-interfaces/dist/runtimeDapp";
import { RunProcess } from "@o-platform/o-process/dist/events/runProcess";
import { shellProcess, ShellProcessContext } from "../shared/processes/shellProcess";
import Error from "../shared/atoms/Error.svelte";
import LoadingIndicator from "../shared/atoms/LoadingIndicator.svelte";
import Success from "../shared/atoms/Success.svelte";
import { getUbi } from "./o-banking/processes/getUbi";
import { hubSignup } from "./o-banking/processes/hubSignup";
import { setTrust } from "./o-banking/processes/setTrust";
import { transfer } from "./o-banking/processes/transfer";

const transactions: PageManifest = {
  isDefault: true,
  routeParts: ["transactions"],
  component: Transactions,
  title: "Transactions",
  available: [
    (detail) => {
      // Can navigate to?
      // Sure!
      return true;
    }
  ]
};

const tokens: PageManifest = {
  isDefault: true,
  routeParts: ["tokens"],
  component: Tokens,
  title: "Tokens",
  available: [
    (detail) => {
      // Can navigate to?
      // Sure!
      return true;
    }
  ]
};

const trusts: PageManifest = {
  isDefault: true,
  routeParts: ["trusts"],
  component: Trusts,
  title: "Trusts",
  available: [
    (detail) => {
      // Can navigate to?
      // Sure!
      return true;
    }
  ]
};

const graph: PageManifest = {
  isDefault: true,
  routeParts: ["graph"],
  component: Graph,
  title: "Graph",
  available: [
    (detail) => {
      // Can navigate to?
      // Sure!
      return true;
    }
  ]
};


export interface DappState {
  // put state here
}

export const banking: DappManifest<DappState> = {
  dappId: "banking:1",
  isSingleton: true,
  dependencies: [],
  isHidden: false,
  icon: faPeopleArrows,
  title: "Banking",
  routeParts: ["banking"],
  tag: Promise.resolve("alpha"),
  isEnabled: true,
  actions: [{
    key: "getUbi",
    label: "Get UBI",
    event: (runtimeDapp: RuntimeDapp<any>) => {
      return new RunProcess<ShellProcessContext>(
        shellProcess,
        true,
        async (ctx) => {
          ctx.childProcessDefinition = getUbi;
          ctx.childContext = {
            data: {
            },
            dirtyFlags: {},
            environment: {
              errorView: Error,
              progressView: LoadingIndicator,
              successView: Success,
            },
          };
          return ctx;
        });
    }
  }, {
    key: "hubSignup",
    label: "Signup at Circles Hub",
    event: (runtimeDapp: RuntimeDapp<any>) => {
      return new RunProcess<ShellProcessContext>(
        shellProcess,
        true,
        async (ctx) => {
          ctx.childProcessDefinition = hubSignup;
          ctx.childContext = {
            data: {
            },
            dirtyFlags: {},
            environment: {
              errorView: Error,
              progressView: LoadingIndicator,
              successView: Success,
            },
          };
          return ctx;
        });
    }
  }, {
    key: "setTrust",
    label: "Set Trust",
    event: (runtimeDapp: RuntimeDapp<any>) => {
      return new RunProcess<ShellProcessContext>(
        shellProcess,
        true,
        async (ctx) => {
          ctx.childProcessDefinition = setTrust;
          ctx.childContext = {
            data: {
            },
            dirtyFlags: {},
            environment: {
              errorView: Error,
              progressView: LoadingIndicator,
              successView: Success,
            },
          };
          return ctx;
        });
    }
  }, {
    key: "transfer",
    label: "Send Money",
    event: (runtimeDapp: RuntimeDapp<any>) => {
      return new RunProcess<ShellProcessContext>(
        shellProcess,
        true,
        async (ctx) => {
          ctx.childProcessDefinition = transfer;
          ctx.childContext = {
            data: {
            },
            dirtyFlags: {},
            environment: {
              errorView: Error,
              progressView: LoadingIndicator,
              successView: Success,
            },
          };
          return ctx;
        });
    }
  }],
  initialize: async (stack, runtimeDapp) => {
    // Do init stuff here
    return {
      initialPage: transactions,
      cancelDependencyLoading: false
    };
  },
  pages: [transactions, tokens, trusts, graph]
};