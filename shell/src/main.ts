import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {IShell} from "./shared/interfaces/shell";
import {shellEvents} from "./shared/shellEvents";
import {ProcessDefinition} from "@o-platform/o-process/dist/interfaces/processManifest";
import {ProcessContext} from "@o-platform/o-process/dist/interfaces/processContext";
import {useMachine} from "xstate-svelte";
import {Subject} from "rxjs";
import {ProcessEvent} from "@o-platform/o-process/dist/interfaces/processEvent";
import {Bubble} from "@o-platform/o-process/dist/events/bubble";
import {Process} from "@o-platform/o-process/dist/interfaces/process";
import {PlatformEvent} from "@o-platform/o-events/dist/platformEvent";
import {Sinker} from "@o-platform/o-process/dist/events/sinker";
import {ApiConnection} from "./shared/apiConnection";

import LoadingIndicator from "./shared/atoms/LoadingIndicator.svelte";
import Success from "./shared/atoms/Success.svelte";
import Error from "./shared/atoms/Error.svelte";
import App from "src/App.svelte";

dayjs.extend(relativeTime)

declare global {
  interface Window {
    o: IShell
  }
}

export async function getProcessContext(): Promise<ProcessContext<any>> {
  return <ProcessContext<any>>{
    data: {}
  };
}

const shell: IShell = {
  stateMachines: {
    async run<TContext>(definition: ProcessDefinition<any, any>, contextModifier?: (processContext: ProcessContext<any>) => Promise<TContext>) {
      console.log("Starting process:", definition);

      const {service, state, send} = useMachine(
        (<any>definition).stateMachine(LoadingIndicator, Success, Error),
        {
          context: contextModifier
            ? await contextModifier(await getProcessContext())
            : await getProcessContext()
        });

      const processEvents = new Subject<ProcessEvent>();

      service.onTransition((state1, event) => {
        if (event.type == 'error.platform' || event.type == "xstate.error") {
          console.error(`An error occurred during the execution of process '${definition.name}'::`, event);
        }
        if (event.type == "process.ipc.bubble") {
          process.lastReceivedBubble = <Bubble>event;
        }

        console.log(`window.o.stateMachines: forwarding event to the processEvents stream of process '${definition.name}':`, event);
        processEvents.next(<any>{
          stopped: false,
          currentState: state1,
          previousState: state1.history,
          event: event
        });
      });

      service.onStop(() => {
        processEvents.next({
          stopped: true
        });
        this._current = null;
      });

      const process: Process = {
        id: 0,
        /*
        TODO: Cast to <any> because of:
        ERROR in /home/daniel/src/o-dapp-starter/shell/src/main.ts
        [tsl] ERROR in /home/daniel/src/o-dapp-starter/shell/src/main.ts(70,9)
              TS2322: Type 'Subject<ProcessEvent>' is not assignable to type 'Observable<ProcessEvent>'.
          The types of 'source.operator.call' are incompatible between these types.
            Type '(subscriber: import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Subscriber").Subscriber<any>, source: any) => import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/types").TeardownLogic' is not assignable to type '(subscriber: import("/home/daniel/src/o-dapp-starter/node_modules/rxjs/internal/Subscriber").Subscriber<any>, source: any) => import("/home/daniel/src/o-dapp-starter/node_modules/rxjs/internal/types").TeardownLogic'.
              Types of parameters 'subscriber' and 'subscriber' are incompatible.
                Type 'import("/home/daniel/src/o-dapp-starter/node_modules/rxjs/internal/Subscriber").Subscriber<any>' is not assignable to type 'import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Subscriber").Subscriber<any>'.
                  Property 'isStopped' is protected but type 'Subscriber<T>' is not a class derived from 'Subscriber<T>'.
         */
        events: <any>processEvents,
        lastReceivedBubble: null,
        sendEvent: (event: any) => send(event),
        sendAnswer(answer: PlatformEvent) {
          if (!this.lastReceivedBubble || this.lastReceivedBubble.noReply) {
            throw new window.Error("Cannot answer because no Bubble event was received before or the event hat the 'noReply' property set.")
          }
          process.sendEvent(<Sinker>{
            type: "process.ipc.sinker",
            levels: this.lastReceivedBubble.levels ?? 0,
            backTrace: this.lastReceivedBubble.trace,
            wrappedEvent: answer
          });
        }
      };

      service.start();
      return process;
    }
  },
  /*
  TODO: Cast to <any> because of:
  ERROR in /home/daniel/src/o-dapp-starter/shell/src/main.ts
  [tsl] ERROR in /home/daniel/src/o-dapp-starter/shell/src/main.ts(90,3)
        TS2322: Type 'import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/Subject").Subject<import("/home/daniel/src/o-dapp-starter/packages/o-events/dist/omoEvent").PlatformEvent>' is not assignable to type 'import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Subject").Subject<import("/home/daniel/src/o-dapp-starter/packages/o-events/dist/omoEvent").PlatformEvent>'.
    Types of property 'lift' are incompatible.
      Type '<R>(operator: import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/Operator").Operator<import("/home/daniel/src/o-dapp-starter/packages/o-events/dist/omoEvent").PlatformEvent, R>) => import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/Observable").Observable<...' is not assignable to type '<R>(operator: import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Operator").Operator<import("/home/daniel/src/o-dapp-starter/packages/o-events/dist/omoEvent").PlatformEvent, R>) => import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Observable").Observable<...>'.
        Types of parameters 'operator' and 'operator' are incompatible.
          Type 'import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Operator").Operator<import("/home/daniel/src/o-dapp-starter/packages/o-events/dist/omoEvent").PlatformEvent, R>' is not assignable to type 'import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/Operator").Operator<import("/home/daniel/src/o-dapp-starter/packages/o-events/dist/omoEvent").PlatformEvent, R>'.
            Types of property 'call' are incompatible.
              Type '(subscriber: import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Subscriber").Subscriber<R>, source: any) => import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/types").TeardownLogic' is not assignable to type '(subscriber: import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/Subscriber").Subscriber<R>, source: any) => import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/types").TeardownLogic'.
                Types of parameters 'subscriber' and 'subscriber' are incompatible.
                  Type 'import("/home/daniel/src/o-dapp-starter/packages/o-utils/node_modules/rxjs/internal/Subscriber").Subscriber<R>' is not assignable to type 'import("/home/daniel/src/o-dapp-starter/shell/node_modules/rxjs/internal/Subscriber").Subscriber<R>'.
                    Property 'isStopped' is protected but type 'Subscriber<T>' is not a class derived from 'Subscriber<T>'.

   */
  events: <any>shellEvents.observable,
  publishEvent: event => shellEvents.publish(event),
  graphQLClient: null
};

async function connectToApi() {
  const apiConnection = new ApiConnection("http://localhost:1234/");
  shell.graphQLClient = await apiConnection.client.subscribeToResult();
  console.log("GraphQL client ready:", shell.graphQLClient);
}
connectToApi();

window.o = shell;

console.log("Starting ..", {
  userAgent: navigator.userAgent
})

export default new App({
  target: document.body,
});
