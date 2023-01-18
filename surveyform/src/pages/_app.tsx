// import "~/stylesheets/main.scss";
import { NextPage } from "next";
import App, { AppContext, AppProps } from "next/app";
import { ReactElement } from "react";

import Head from "next/head";
import { VulcanCurrentUserProvider } from "@devographics/react-form";
import { Analytics } from "@vercel/analytics/react";

import debug from "debug";

const debugPerf = debug("vns:perf");
// @see https://nextjs.org/docs/advanced-features/measuring-performance
export function reportWebVitals(metric) {
  debugPerf(metric); // The metric object ({ id, name, startTime, value, label }) is logged to the console
}

import { ApolloProvider } from "@apollo/client";
import { useApollo } from "@vulcanjs/next-apollo";
import { useUser } from "~/account/user/hooks";

import { LocaleContextProvider } from "~/i18n/components/LocaleContext";

//import "~/stylesheets/main.scss";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

import { ErrorBoundary } from "~/core/components/error";
import { getAppGraphqlUri } from "~/lib/graphql";
import Layout from "~/core/components/common/Layout";
//import { useCookies } from "react-cookie";

// @see https://nextjs.org/docs/basic-features/layouts#with-typescript
// Doc says to use "ReactNode" as the return type at the time of writing (09/2021) but then that fails appWithTranslation
// , ReactElement seems more appropriate
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement; //ReactNode;
};

export interface VNAppProps extends AppProps {
  Component: NextPageWithLayout;
  /** Locale extracted from cookies server-side */
  pageProps: {
    locale?: string;
    localeStrings?: any;
    initialApolloState?: any;
    // When on a specific survey
    year?: string;
    slug?: string;
  };
  /**
   * The request origin
   * Will allow to have consistent SSR without needing
   * to setup an explicit graphql URI
   */
  //origin?: string;
}

const Favicons = () => (
  <>
    {/* Favicon created using https://realfavicongenerator.net/ */}
    <link rel="manifest" href="/site.webmanifest"></link>
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"></link>
    <meta name="msapplication-TileColor" content="#da532c"></meta>
    <meta name="theme-color" content="#ffffff"></meta>
  </>
);

function VNApp({ Component, pageProps }: VNAppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState, {
    graphqlUri: getAppGraphqlUri(/*origin*/),
    crossDomainGraphqlUri:
      !!process.env.NEXT_PUBLIC_CROSS_DOMAIN_GRAPHQL_URI || false,
  }); // you can also easily setup ApolloProvider on a per-page basis
  // Use the layout defined at the page level, if available
  // @see https://nextjs.org/docs/basic-features/layouts
  const { user } = useUser();

  const getLayout = Component.getLayout ?? ((page) => page);

  const { locale, localeStrings } = pageProps;

  return (
    <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
      {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
      {getLayout(
        <ApolloProvider client={apolloClient}>
          <LocaleContextProvider
            localeId={locale || "en-US"}
            localeStrings={localeStrings}
            currentUser={user}
          >
            <VulcanCurrentUserProvider
              // @ts-ignore FIXME: weird error with groups
              value={{
                currentUser: user || null,
                loading:
                  false /* TODO: we don't get the loading information from useUser yet */,
              }}
            >
              <Head>
                <title>Devographics Surveys</title>
                <meta
                  name="viewport"
                  content="minimum-scale=1, initial-scale=1, width=device-width"
                />
                <Favicons />
              </Head>
              <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
                <Layout
                  surveySlug={pageProps?.slug}
                  surveyYear={pageProps?.year}
                >
                  {/** @ts-ignore */}
                  <Component {...pageProps} />
                  <Analytics />
                </Layout>
              </ErrorBoundary>
            </VulcanCurrentUserProvider>
          </LocaleContextProvider>
        </ApolloProvider>
      )}
    </ErrorBoundary>
  );
}

export default VNApp;
