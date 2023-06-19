import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Client, Server } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme, DarkTheme } from "baseui";
import { api } from "~/utils/api";

import "~/styles/globals.css";

const getHydrateClass = (): HTMLCollectionOf<HTMLStyleElement> =>
  document.getElementsByClassName(
    "_styletron_hydrate_"
  ) as HTMLCollectionOf<HTMLStyleElement>;

const engine =
  typeof window === "undefined"
    ? new Server()
    : new Client({
        hydrate: getHydrateClass(),
      });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <StyletronProvider value={engine}>
        <BaseProvider
          theme={
            typeof window !== "undefined" &&
            window?.matchMedia?.("(prefers-color-scheme: dark)").matches
              ? DarkTheme
              : LightTheme
          }
        >
          <Component {...pageProps} />
        </BaseProvider>
      </StyletronProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
