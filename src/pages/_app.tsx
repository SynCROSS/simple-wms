import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme } from "baseui";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const engine = new Styletron();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <StyletronProvider value={engine}>
        <BaseProvider theme={LightTheme}>
          <Component {...pageProps} />
        </BaseProvider>
      </StyletronProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
