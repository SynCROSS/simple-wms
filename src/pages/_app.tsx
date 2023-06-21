import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme, DarkTheme } from "baseui";
import RenderIfAuthenticated from "~/components/common/RenderIfAuthenticated";
import Layout from "~/components/common/Layout";
import { engine } from "~/styletron";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import "sanitize.css";

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
          <RenderIfAuthenticated>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </RenderIfAuthenticated>
        </BaseProvider>
      </StyletronProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
