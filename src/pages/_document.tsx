import { Server } from "styletron-engine-atomic";
import { engine } from "~/styletron";
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { Provider as StyletronProvider } from "styletron-react";

type StyleSheet = {
  css: string;
  attrs: {
    media: string;
    "data-hydrate": unknown;
  };
};

type MyDocumentProps = {
  stylesheets: StyleSheet[];
};

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const page = await ctx.renderPage({
      // eslint-disable-next-line react/display-name
      enhanceApp: (App: any) => (props: any) =>
        (
          <StyletronProvider value={engine}>
            <App {...props} />
          </StyletronProvider>
        ),
    });
    const stylesheets = (engine as Server).getStylesheets() || [];

    // Run the parent `getInitialProps`, it now includes the custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps, ...page, stylesheets };
  }

  render() {
    return (
      <Html>
        <Head>
          {this.props.stylesheets.map((sheet, i) => (
            <style
              key={i}
              className="_styletron_hydrate_"
              dangerouslySetInnerHTML={{ __html: sheet.css }}
              media={sheet.attrs.media}
              data-hydrate={sheet.attrs["data-hydrate"]}
            />
          ))}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
